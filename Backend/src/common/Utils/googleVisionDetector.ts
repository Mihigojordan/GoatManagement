import { Injectable, Logger } from '@nestjs/common';
import vision from '@google-cloud/vision';

@Injectable()
export class GoogleVisionService {
  private readonly logger = new Logger(GoogleVisionService.name);
  private client = new vision.ImageAnnotatorClient({
    keyFilename: './abyridellcsoftware-66b5af57b88e.json', // update path here
  });

  async detectDocumentType(filePath: string): Promise<string> {
    try {
      const [result] = await this.client.documentTextDetection(filePath);
      const text = result.fullTextAnnotation?.text?.toLowerCase() || '';

      if (!text) return 'unknown';

      if (text.includes('passport') || text.includes('id number')) return 'passport';
      if (text.includes('bank statement') || text.includes('account number')) return 'bank_statement';
      if (text.includes('medical certificate')) return 'medical_certificate';
      if (text.includes('police clearance')) return 'police_clearance';
      if (text.includes('proof of address') || text.includes('address')) return 'proof_of_address';
      if (text.includes('driving license') || text.includes('driving permit')) return 'driving_certificate';
      if (text.includes('work permit') || text.includes('visa')) return 'work_permit';
      if (text.includes('drug test')) return 'drug_test_report';
      if (text.includes('reference letter') || text.includes('employment reference')) return 'employment_reference_letter';

      return 'unknown';
    } catch (error) {
      this.logger.error(`Vision API error: ${error.message}`);
      return 'unknown';
    }
  }

  async mapFilesToDriverFields(filePaths: string[]): Promise<Record<string, string>> {
    const mappedFiles: Record<string, string> = {};

    for (const filePath of filePaths) {
      const docType = await this.detectDocumentType(filePath);

      switch (docType) {
        case 'passport':
          mappedFiles.nationalIdOrPassport = filePath;
          break;
        case 'bank_statement':
          mappedFiles.bankStatementFile = filePath;
          break;
        case 'medical_certificate':
          mappedFiles.medicalCertificate = filePath;
          break;
        case 'police_clearance':
          mappedFiles.policeClearanceCertificate = filePath;
          break;
        case 'proof_of_address':
          mappedFiles.proofOfAddress = filePath;
          break;
        case 'driving_certificate':
          mappedFiles.drivingCertificate = filePath;
          break;
        case 'work_permit':
          mappedFiles.workPermitOrVisa = filePath;
          break;
        case 'drug_test_report':
          mappedFiles.drugTestReport = filePath;
          break;
        case 'employment_reference_letter':
          mappedFiles.employmentReferenceLetter = filePath;
          break;
        default:
          this.logger.log(`Unknown document type for file: ${filePath}`);
      }
    }

    return mappedFiles;
  }
}
