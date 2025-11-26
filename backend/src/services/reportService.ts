import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool';
import { PetPhoto, PetReport, ReportFilters, ReportStatus, ReportType } from '../types/report';
import { HttpException } from '../utils/httpException';

type CreateReportPayload = {
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerLineId?: string;
  petName: string;
  species: string;
  breed?: string;
  color?: string;
  sex?: 'male' | 'female' | 'unknown';
  ageYears?: number;
  microchipId?: string;
  specialMark?: string;
  reportType: ReportType;
  status?: ReportStatus;
  dateLost: string;
  province?: string;
  district?: string;
  lastSeenAddress?: string;
  lastSeenLat?: number | null;
  lastSeenLng?: number | null;
  rewardAmount?: number;
  description?: string;
  photoUrl?: string | null;
};

const mapRowToReport = (row: RowDataPacket, photos: Map<number, PetPhoto[]>): PetReport => ({
  id: row.report_id,
  petId: row.pet_id,
  dateLost: row.date_lost,
  province: row.province,
  district: row.district,
  lastSeenAddress: row.last_seen_address,
  lastSeenLat: row.last_seen_lat,
  lastSeenLng: row.last_seen_lng,
  rewardAmount: Number(row.reward_amount ?? 0),
  status: row.status,
  reportType: row.report_type,
  description: row.description,
  createdAt: row.report_created_at,
  updatedAt: row.report_updated_at,
  pet: {
    id: row.pet_id,
    ownerId: row.owner_id,
    name: row.pet_name,
    species: row.species,
    breed: row.breed,
    color: row.color,
    sex: row.sex,
    ageYears: row.age_years !== null && row.age_years !== undefined ? Number(row.age_years) : null,
    microchipId: row.microchip_id,
    specialMark: row.special_mark,
    mainPhotoUrl: row.main_photo_url,
  },
  owner: {
    id: row.owner_id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    lineId: row.line_id,
  },
  photos: photos.get(row.pet_id) ?? [],
});

const buildFilters = (filters: ReportFilters) => {
  const where: string[] = [];
  const values: (string | number)[] = [];

  if (filters.district) {
    where.push('lr.district = ?');
    values.push(filters.district);
  }
  if (filters.province) {
    where.push('lr.province = ?');
    values.push(filters.province);
  }
  if (filters.species) {
    where.push('p.species = ?');
    values.push(filters.species);
  }
  if (filters.status) {
    where.push('lr.status = ?');
    values.push(filters.status);
  }
  if (filters.reportType) {
    where.push('lr.report_type = ?');
    values.push(filters.reportType);
  }
  if (filters.search) {
    where.push('(p.name LIKE ? OR p.breed LIKE ? OR p.color LIKE ? OR lr.description LIKE ? OR p.special_mark LIKE ?)');
    values.push(
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
    );
  }

  return { where: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
};

const fetchPhotosByPetIds = async (petIds: number[]): Promise<Map<number, PetPhoto[]>> => {
  const photos = new Map<number, PetPhoto[]>();
  if (!petIds.length) return photos;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, pet_id, photo_url, is_main, created_at FROM pet_photos WHERE pet_id IN (?)`,
    [petIds],
  );

  rows.forEach((row) => {
    const entry: PetPhoto = {
      id: row.id,
      petId: row.pet_id,
      photoUrl: row.photo_url,
      isMain: Boolean(row.is_main),
      createdAt: row.created_at,
    };
    const list = photos.get(row.pet_id) ?? [];
    list.push(entry);
    photos.set(row.pet_id, list);
  });

  return photos;
};

const fetchReportsWithPhotos = async (filters: ReportFilters & { id?: number }): Promise<PetReport[]> => {
  const { where, values } = buildFilters(filters);
  const idClause = filters.id ? `${where ? `${where} AND` : 'WHERE'} lr.id = ?` : where;
  const query = `
    SELECT
      lr.id AS report_id,
      lr.pet_id,
      lr.date_lost,
      lr.province,
      lr.district,
      lr.last_seen_address,
      lr.last_seen_lat,
      lr.last_seen_lng,
      lr.reward_amount,
      lr.status,
      lr.report_type,
      lr.description,
      lr.created_at AS report_created_at,
      lr.updated_at AS report_updated_at,
      p.name AS pet_name,
      p.species,
      p.breed,
      p.color,
      p.sex,
      p.age_years,
      p.microchip_id,
      p.special_mark,
      p.main_photo_url,
      p.owner_id,
      o.full_name,
      o.phone,
      o.email,
      o.line_id
    FROM lost_reports lr
    JOIN pets p ON lr.pet_id = p.id
    JOIN owners o ON p.owner_id = o.id
    ${idClause}
    ORDER BY lr.created_at DESC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, filters.id ? [...values, filters.id] : values);
  const petIds = rows.map((row) => row.pet_id);
  const photos = await fetchPhotosByPetIds(petIds);

  return rows.map((row) => mapRowToReport(row, photos));
};

const insertOwner = async (conn: PoolConnection, payload: CreateReportPayload) => {
  const [ownerResult] = await conn.query<ResultSetHeader>(
    `INSERT INTO owners (full_name, phone, email, line_id) VALUES (?, ?, ?, ?)`,
    [payload.ownerName, payload.ownerPhone, payload.ownerEmail ?? null, payload.ownerLineId ?? null],
  );
  return ownerResult.insertId;
};

const insertPet = async (conn: PoolConnection, ownerId: number, payload: CreateReportPayload) => {
  const [petResult] = await conn.query<ResultSetHeader>(
    `INSERT INTO pets (owner_id, name, species, breed, color, sex, age_years, microchip_id, special_mark, main_photo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ownerId,
      payload.petName,
      payload.species,
      payload.breed ?? null,
      payload.color ?? null,
      payload.sex ?? 'unknown',
      payload.ageYears ?? null,
      payload.microchipId ?? null,
      payload.specialMark ?? null,
      payload.photoUrl ?? null,
    ],
  );
  return petResult.insertId;
};

const insertReport = async (conn: PoolConnection, petId: number, payload: CreateReportPayload) => {
  const [reportResult] = await conn.query<ResultSetHeader>(
    `INSERT INTO lost_reports
      (pet_id, date_lost, province, district, last_seen_address, last_seen_lat, last_seen_lng, reward_amount, status, report_type, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      petId,
      payload.dateLost,
      payload.province ?? null,
      payload.district ?? null,
      payload.lastSeenAddress ?? null,
      payload.lastSeenLat ?? null,
      payload.lastSeenLng ?? null,
      payload.rewardAmount ?? 0,
      payload.status ?? 'lost',
      payload.reportType ?? 'lost',
      payload.description ?? null,
    ],
  );
  return reportResult.insertId;
};

export const reportService = {
  async list(filters: ReportFilters): Promise<PetReport[]> {
    return fetchReportsWithPhotos(filters);
  },

  async findById(id: number): Promise<PetReport> {
    const reports = await fetchReportsWithPhotos({ id });
    if (!reports.length) {
      throw new HttpException(404, 'Report not found');
    }
    return reports[0];
  },

  async create(data: CreateReportPayload): Promise<PetReport> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const ownerId = await insertOwner(conn, data);
      const petId = await insertPet(conn, ownerId, data);

      if (data.photoUrl) {
        await conn.query<ResultSetHeader>(
          `INSERT INTO pet_photos (pet_id, photo_url, is_main) VALUES (?, ?, 1)`,
          [petId, data.photoUrl],
        );
      }

      const reportId = await insertReport(conn, petId, data);
      await conn.commit();
      return this.findById(reportId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async updateStatus(id: number, status: ReportStatus): Promise<PetReport> {
    const [result] = await pool.query<ResultSetHeader>('UPDATE lost_reports SET status = ? WHERE id = ?', [status, id]);
    if (!result.affectedRows) {
      throw new HttpException(404, 'Report not found');
    }
    return this.findById(id);
  },

  async summary() {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        COUNT(*) AS total,
        SUM(report_type = 'lost') AS lost,
        SUM(report_type = 'found') AS found,
        SUM(report_type = 'sighted') AS sighted,
        SUM(status = 'closed') AS closed
      FROM lost_reports
    `);

    const result = rows[0] || {};
    return {
      total: Number(result.total) || 0,
      lost: Number(result.lost) || 0,
      found: Number(result.found) || 0,
      sighted: Number(result.sighted) || 0,
      closed: Number(result.closed) || 0,
    };
  },

  async remove(id: number) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query<RowDataPacket[]>(
        `SELECT lr.pet_id, p.owner_id FROM lost_reports lr JOIN pets p ON lr.pet_id = p.id WHERE lr.id = ?`,
        [id],
      );

      if (!rows.length) {
        throw new HttpException(404, 'Report not found');
      }

      const { pet_id: petId, owner_id: ownerId } = rows[0];

      await conn.query('DELETE FROM pet_photos WHERE pet_id = ?', [petId]);
      await conn.query('DELETE FROM lost_reports WHERE id = ?', [id]);
      await conn.query('DELETE FROM pets WHERE id = ?', [petId]);
      await conn.query('DELETE FROM owners WHERE id = ? AND NOT EXISTS (SELECT 1 FROM pets WHERE owner_id = ?)', [
        ownerId,
        ownerId,
      ]);

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};
