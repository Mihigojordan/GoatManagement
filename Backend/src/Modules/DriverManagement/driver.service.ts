// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../Prisma/prisma.service';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class DriverService {
//   constructor(private prisma: PrismaService) {}
// // driver.service.ts

// async create(data: any) {

//     console.log('Saving driver data:', data);  // <--- check if file paths are present here

//   // Convert date fields
//   ['dateOfBirth', 'licenseExpiryDate', 'availabilityToStart'].forEach((field) => {
//     if (data[field]) {
//       const date = new Date(data[field]);
//       if (!isNaN(date.getTime())) {
//         data[field] = date;
//       } else {
//         delete data[field]; // or handle the error
//       }
//     }
//   });

//   // Convert numeric fields
//   if (data.yearsOfExperience) {
//     const parsed = parseInt(data.yearsOfExperience, 10);
//     if (!isNaN(parsed)) {
//       data.yearsOfExperience = parsed;
//     } else {
//       delete data.yearsOfExperience; // or handle appropriately
//     }
//   }

//   return this.prisma.driver.create({ data });
// }



//   async findAll() {
//     return this.prisma.driver.findMany();
//   }

//   async findOne(id: number) {
//     return this.prisma.driver.findUnique({ where: { id } });
//   }



//   async update(id: number, data: any) {
//   // Normalize dates
//   ['dateOfBirth', 'licenseExpiryDate', 'availabilityToStart'].forEach((field) => {
//     if (data[field]) {
//       const date = new Date(data[field]);
//       if (!isNaN(date.getTime())) {
//         data[field] = date;
//       } else {
//         delete data[field];
//       }
//     }
//   });

//   // Normalize numeric fields
//   if (data.yearsOfExperience) {
//     const parsed = parseInt(data.yearsOfExperience, 10);
//     if (!isNaN(parsed)) {
//       data.yearsOfExperience = parsed;
//     } else {
//       delete data.yearsOfExperience;
//     }
//   }

//   // If controller did not strip file paths, do it here (optional fallback):
//   Object.keys(data).forEach((key) => {
//     if (typeof data[key] === 'string' && data[key].startsWith('uploads\\')) {
//       const parts = data[key].split(/[/\\]/); // handles both '/' and '\\'
//       data[key] = parts[parts.length - 1];
//     }
//   });

//   return this.prisma.driver.update({ where: { id }, data });
// }

//   async remove(id: number) {
//     // Step 1: Find the driver record first
//     const driver = await this.prisma.driver.findUnique({ where: { id } });

//     if (!driver) throw new Error('Driver not found');

//     // Step 2: List the fields that may contain uploaded file names
//     const fileFields = [
//       'nationalIdOrPassport',
//       'policeClearanceCertificate',
//       'proofOfAddress',
//       'drivingCertificate',
//       'workPermitOrVisa',
//       'drugTestReport',
//       'employmentReferenceLetter',
//       'bankStatementFile',
//     ];

//     // Step 3: Delete each file if it exists
//     fileFields.forEach((field) => {
//       const filename = driver[field];
//       if (filename) {
//         const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
//       }
//     });

//     // Step 4: Remove the driver from the DB
//     return this.prisma.driver.delete({ where: { id } });
//   }

// }
