import { diskStorage } from 'multer';
import { extname } from 'path';



export const multerStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});


export function mapFilesToDriverFields(files: Express.Multer.File[], body: any) {
  console.log('Files received for mapping:', files.map(f => f.originalname));
  
  files.forEach((file) => {
    const normalizedPath = file.path.replace(/\\/g, '/');  
    const name = file.originalname.toLowerCase();

    console.log(`Processing file: ${file.originalname}, mapped path: ${normalizedPath}`);

    if (name.includes('passport') || name.includes('id')) {
      body.nationalIdOrPassport = normalizedPath;
    } else if (name.includes('medical')) {
      body.medicalCertificate = normalizedPath;
    } else if (name.includes('police')) {
      body.policeClearanceCertificate = normalizedPath;
    } else if (name.includes('address')) {
      body.proofOfAddress = normalizedPath;
    } else if (name.includes('photo')) {
      body.passportPhotos = normalizedPath;
    } else if (name.includes('driving')) {
      body.drivingCertificate = normalizedPath;
    } else if (name.includes('permit') || name.includes('visa')) {
      body.workPermitOrVisa = normalizedPath;
    } else if (name.includes('drug')) {
      body.drugTestReport = normalizedPath;
    } else if (name.includes('reference')) {
      body.employmentReferenceLetter = normalizedPath;
    } else if (name.includes('statement')) {
      body.bankStatementFile = normalizedPath;
    } else {
      console.warn(`File ${file.originalname} does not match any known document field`);
    }
  });

  console.log('Body after mapping files:', body);
}
