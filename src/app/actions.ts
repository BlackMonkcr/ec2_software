// src/app/actions.ts
'use server'

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function calculateDistance(city1: string, city2: string) {
  const csvFilePath = path.join(process.cwd(), 'public', 'worldcities.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  const findCity = (cityName: string) => {
    return records.find((record: any) =>
      record.city.toLowerCase() === cityName.toLowerCase() ||
      record.city_ascii.toLowerCase() === cityName.toLowerCase()
    );
  };

  const city1Data = findCity(city1);
  const city2Data = findCity(city2);

  if (!city1Data || !city2Data) {
    throw new Error('City not found');
  }

  const lat1 = parseFloat(city1Data.lat);
  const lon1 = parseFloat(city1Data.lng);
  const lat2 = parseFloat(city2Data.lat);
  const lon2 = parseFloat(city2Data.lng);

  return calculateHaversineDistance(lat1, lon1, lat2, lon2);
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters, rounded to nearest integer
}