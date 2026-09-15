import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { z } from "zod";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { submitLimiter, apiLimiter } from "../../middleware/rateLimiter";
import { sanitize } from "../../middleware/sanitize";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const syncCursorSchema = z.object({
  sinceVersion: z.number().int().nonnegative(),
  targetVersion: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
  contactId: z.string(),
});

type SyncCursor = z.infer<typeof syncCursorSchema>;

function encodeSyncCursor(cursor: SyncCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeSyncCursor(raw: string): SyncCursor {
  try {
    return syncCursorSchema.parse(
      JSON.parse(Buffer.from(raw, "base64url").toString("utf8"))
    );
  } catch {
    throw new AppError(400, "Invalid contacts sync cursor");
  }
}

const createContactSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().min(1).max(30),
  address: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  mapsUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  cityId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

// GET /api/contacts — public
router.get("/", apiLimiter, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const citySlug = req.query.city as string | undefined;
    const categorySlug = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const verified = req.query.verified as string | undefined;

    const where: Record<string, unknown> = { status: "APPROVED" };

    if (citySlug) where.city = { slug: citySlug };
    if (categorySlug) where.category = { slug: categorySlug };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
      ];
    }
    if (verified === "true") where.isVerified = true;
    if (verified === "false") where.isVerified = false;

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { city: true, category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      success: true,
      data: contacts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/version — lightweight version check for local-first caching
router.get("/version", apiLimiter, async (_req, res, next) => {
  try {
    const row = await prisma.collectionVersion.findUnique({
      where: { key: "contacts" },
    });

    res.json({ success: true, version: row?.version ?? 0 });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/all — full approved collection for local-first cache
router.get("/all", apiLimiter, async (_req, res, next) => {
  try {
    const [contacts, versionRow] = await Promise.all([
      prisma.contact.findMany({
        where: { status: "APPROVED" },
        include: { city: true, category: true },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      }),
      prisma.collectionVersion.findUnique({ where: { key: "contacts" } }),
    ]);

    res.json({
      success: true,
      data: contacts,
      version: versionRow?.version ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/sync — incremental public contact collection
router.get("/sync", apiLimiter, async (req, res, next) => {
  try {
    const query = z.object({
      sinceVersion: z.coerce.number().int().nonnegative().default(0),
      cursor: z.string().max(1000).optional(),
      limit: z.coerce.number().int().min(1).max(500).default(200),
    }).parse(req.query);

    const versionRow = await prisma.collectionVersion.findUnique({
      where: { key: "contacts" },
    });
    const currentVersion = versionRow?.version ?? 0;

    // A database restore can move the server version behind a client. Tell the
    // client to discard its local snapshot and perform a clean bootstrap.
    if (query.sinceVersion > currentVersion) {
      res.json({
        success: true,
        data: { upserts: [], deletedIds: [] },
        meta: {
          version: currentVersion,
          nextCursor: null,
          complete: false,
          resetRequired: true,
        },
      });
      return;
    }

    const cursor = query.cursor ? decodeSyncCursor(query.cursor) : null;
    if (cursor && cursor.sinceVersion !== query.sinceVersion) {
      throw new AppError(400, "Contacts sync cursor does not match sinceVersion");
    }

    const targetVersion = cursor?.targetVersion ?? currentVersion;
    if (targetVersion > currentVersion || targetVersion < query.sinceVersion) {
      throw new AppError(400, "Contacts sync cursor has an invalid target version");
    }

    const entries = await prisma.contactSyncEntry.findMany({
      where: {
        revision: { lte: targetVersion },
        ...(cursor
          ? {
              OR: [
                { revision: { gt: cursor.revision } },
                {
                  revision: cursor.revision,
                  contactId: { gt: cursor.contactId },
                },
              ],
            }
          : { revision: { gt: query.sinceVersion } }),
      },
      orderBy: [{ revision: "asc" }, { contactId: "asc" }],
      take: query.limit + 1,
    });

    const hasMore = entries.length > query.limit;
    const pageEntries = entries.slice(0, query.limit);
    const upsertIds = pageEntries
      .filter((entry) => entry.operation === "UPSERT")
      .map((entry) => entry.contactId);

    const currentContacts = upsertIds.length > 0
      ? await prisma.contact.findMany({
          where: { id: { in: upsertIds }, status: "APPROVED" },
          include: { city: true, category: true },
        })
      : [];
    const contactsById = new Map(currentContacts.map((contact) => [contact.id, contact]));

    const upserts = pageEntries
      .map((entry) => contactsById.get(entry.contactId))
      .filter((contact): contact is NonNullable<typeof contact> => Boolean(contact));
    const deletedIds = pageEntries
      .filter((entry) => entry.operation === "DELETE" || !contactsById.has(entry.contactId))
      .map((entry) => entry.contactId);

    const lastEntry = pageEntries.at(-1);
    const nextCursor = hasMore && lastEntry
      ? encodeSyncCursor({
          sinceVersion: query.sinceVersion,
          targetVersion,
          revision: lastEntry.revision,
          contactId: lastEntry.contactId,
        })
      : null;

    res.json({
      success: true,
      data: { upserts, deletedIds },
      meta: {
        version: targetVersion,
        nextCursor,
        complete: !hasMore,
        resetRequired: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id
router.get("/:id", apiLimiter, async (req, res, next) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id as string },
      include: {
        city: true,
        category: true,
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        business: {
          select: { name: true, slug: true, status: true },
        },
      },
    });

    if (!contact || contact.status !== "APPROVED") {
      throw new AppError(404, "Contact not found");
    }

    // An inactive storefront must not be discoverable through a public contact profile.
    res.json({
      success: true,
      data: contact.business?.status === "ACTIVE" ? contact : { ...contact, business: null },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts — authenticated users submit contacts
router.post(
  "/",
  authenticate,
  submitLimiter,
  sanitize,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = createContactSchema.parse(req.body);

      const contact = await prisma.contact.create({
        data: {
          ...data,
          submittedById: req.userId!,
          status: "PENDING",
        },
      });

      // Mark user as contributor
      await prisma.profile.update({
        where: { id: req.userId },
        data: { hasContributed: true },
      });

      res.status(201).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/contacts/bulk — authenticated users bulk submit (PENDING)
const bulkSubmitSchema = z.object({
  contacts: z.array(
    z.object({
      name: z.string().min(1).max(200),
      phone: z.string().min(3).max(30),
      address: z.string().max(500).optional(),
    })
  ).min(1).max(50),
  cityId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

router.post(
  "/bulk",
  authenticate,
  submitLimiter,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { contacts, cityId, categoryId } = bulkSubmitSchema.parse(req.body);

      const created = await prisma.contact.createMany({
        data: contacts.map((c) => ({
          name: c.name,
          phone: c.phone,
          address: c.address || null,
          cityId,
          categoryId,
          submittedById: req.userId!,
          status: "PENDING" as const,
        })),
        skipDuplicates: true,
      });

      // Mark user as contributor
      if (created.count > 0) {
        await prisma.profile.update({
          where: { id: req.userId },
          data: { hasContributed: true },
        });
      }

      res.status(201).json({ success: true, data: { count: created.count } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
