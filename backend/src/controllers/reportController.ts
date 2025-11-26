import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import { HttpException } from '../utils/httpException';
import { ReportStatus } from '../types/report';
import { storageService } from '../services/storageService';
import type { AuthUser } from '../middleware/authMiddleware';
import { userService } from '../services/userService';

export const reportController = {
  async list(req: Request, res: Response) {
    const { district, province, species, status, reportType, search } = req.query;
    const reports = await reportService.list({
      district: district as string | undefined,
      province: province as string | undefined,
      species: species as string | undefined,
      status: status as ReportStatus | undefined,
      reportType: reportType as 'lost' | 'found' | 'sighted' | undefined,
      search: search as string | undefined,
    });
    res.json(reports);
  },

  async getById(req: Request, res: Response) {
    const report = await reportService.findById(Number(req.params.id));
    res.json(report);
  },

  async create(req: Request, res: Response) {
    const body = req.body;
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user) {
      throw new HttpException(401, 'Unauthorized');
    }

    const dbUser = await userService.findById(user.id);
    if (!dbUser) {
      throw new HttpException(404, 'User not found');
    }

    let photoUrl: string | null = null;

    if (req.file) {
      photoUrl = await storageService.uploadPetPhoto(req.file);
    }

    const payload = {
      ownerName: body.ownerName ?? dbUser.fullname,
      ownerPhone: body.ownerPhone ?? dbUser.phone ?? '',
      ownerEmail: body.ownerEmail ?? dbUser.email,
      ownerLineId: body.ownerLineId ?? dbUser.lineId,
      petName: body.petName,
      species: body.species,
      breed: body.breed,
      color: body.color,
      sex: body.sex,
      ageYears: body.ageYears,
      microchipId: body.microchipId,
      specialMark: body.specialMark,
      reportType: body.reportType,
      status: body.status ?? 'lost',
      dateLost: body.dateLost,
      province: body.province,
      district: body.district,
      lastSeenAddress: body.lastSeenAddress,
      lastSeenLat: body.lastSeenLat ?? null,
      lastSeenLng: body.lastSeenLng ?? null,
      rewardAmount: body.rewardAmount ?? 0,
      description: body.description,
      photoUrl,
      userId: dbUser.id,
    };

    const report = await reportService.create(payload);
    res.status(201).json(report);
  },

  async updateStatus(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new HttpException(400, 'Invalid report id');
    }

    const user = (req as Request & { user?: AuthUser }).user;
    if (!user) {
      throw new HttpException(401, 'Unauthorized');
    }

    if (user.role !== 'admin') {
      const owned = await reportService.isOwnedByUser(id, user.id);
      if (!owned) {
        throw new HttpException(403, 'You can only update your own reports');
      }
    }

    const { status } = req.body;
    const report = await reportService.updateStatus(id, status);
    res.json(report);
  },

  async updateDetails(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new HttpException(400, 'Invalid report id');
    }
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user) {
      throw new HttpException(401, 'Unauthorized');
    }
    if (user.role !== 'admin') {
      const owned = await reportService.isOwnedByUser(id, user.id);
      if (!owned) {
        throw new HttpException(403, 'You can only edit your own reports');
      }
    }

    const updated = await reportService.updateDetails(id, req.body);
    res.json(updated);
  },

  async summary(_req: Request, res: Response) {
    const stats = await reportService.summary();
    res.json(stats);
  },

  async mine(req: Request, res: Response) {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user) {
      throw new HttpException(401, 'Unauthorized');
    }
    const reports = await reportService.list({ userId: user.id });
    res.json(reports);
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new HttpException(400, 'Invalid report id');
    }

    await reportService.remove(id);
    res.status(204).send();
  },
};
