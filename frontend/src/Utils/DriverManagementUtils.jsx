import Swal from 'sweetalert2';

export const fetchDriversUtil = async(serviceInstance) => {
    const data = await serviceInstance.getDrivers();
    return data;
};

export const filterDriversUtil = (drivers, filters) => {
    return drivers.filter((driver) => {
        const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
        const matchName = fullName.includes(filters.name.toLowerCase());
        const dobStr = driver.dateOfBirth ?.slice(0, 10) || '';
        const matchDOB = filters.dob ? dobStr === filters.dob : true;
        const createdAtDate = driver.createdAt ?.slice(0, 10) || '';
        const matchCreatedDate = filters.createdDate ? createdAtDate === filters.createdDate : true;
        return matchName && matchDOB && matchCreatedDate;
    });
};

export const initFormDataUtil = (driver = {}) => ({
  // Text fields (unchanged)
  firstName: driver.firstName || '',
  lastName: driver.lastName || '',
  dateOfBirth: driver.dateOfBirth?.slice(0, 10) || '',
  gender: driver.gender || '',
  nationality: driver.nationality || '',
  phoneNumber: driver.phoneNumber || '',
  email: driver.email || '',
  address: driver.address || '',
  emergencyContactName: driver.emergencyContactName || '',
  emergencyContactNumber: driver.emergencyContactNumber || '',
  bankAccountNumber: driver.bankAccountNumber || '',
  licenseId: driver.licenseId || '',
  licenseExpiryDate: driver.licenseExpiryDate?.slice(0, 10) || '',
  yearsOfExperience: driver.yearsOfExperience || '',
  languages: driver.languages || '',
  previousEmployment: driver.previousEmployment || '',
  availabilityToStart: driver.availabilityToStart?.slice(0, 10) || '',

  // File fields initialized as `null` (critical change)
  nationalIdOrPassport: null, // Was: driver.nationalIdOrPassport || ''

  policeClearanceCertificate: null,
  proofOfAddress: null,

  drivingCertificate: null,
  workPermitOrVisa: null,
  drugTestReport: null,
  employmentReferenceLetter: null,
  bankStatementFile: null
});


export const notifySuccess = (message) =>
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        showConfirmButton:true,
        timer: 2000,
        toast: true,
        position: 'center'
    });

export const notifyError = (message) =>
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        toast: true,

        showConfirmButton:true,
        timer: 3000
    });