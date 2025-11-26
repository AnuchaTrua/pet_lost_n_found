import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import { HttpException } from '../utils/httpException';
import { ReportStatus } from '../types/report';
import { storageService } from '../services/storageService';

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
    let photoUrl: string | null = null;

    if (req.file) {
      photoUrl = await storageService.uploadPetPhoto(req.file);
    }

    const payload = {
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      ownerEmail: body.ownerEmail,
      ownerLineId: body.ownerLineId,
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
    };

    const report = await reportService.create(payload);
    res.status(201).json(report);
  },

  async updateStatus(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new HttpException(400, 'Invalid report id');
    }

    const { status } = req.body;
    const report = await reportService.updateStatus(id, status);
    res.json(report);
  },

  async summary(_req: Request, res: Response) {
    const stats = await reportService.summary();
    res.json(stats);
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
