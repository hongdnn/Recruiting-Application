export const Constants = {
    userStatus: ["approval", "lock", "invisible"],
    accountType: ["collaborator", "employer"],
    postStatus: ["active", "close", "pause"],
    jobLevel: ["Quản Lý Điều Hành", "Quản Lý Cao Cấp", "Quản Lý / Chuyên Gia / Chuyên Gia Tư Vấn Cao Cấp",
        "Chuyên Gia Cao Cấp / Trưởng Nhóm / Giám Sát", "Chuyên Gia / Có Kinh Nghiệm", "Mới Ra Trường / Thực Tập"],
    typeWork: ["Fulltime", "Parttime"],
    interviewType: ['phone', 'online', 'face to face'],
    educationLevel: ['bachelor', 'master', 'phD', 'doctor','intermediate','high school graduated'],
    currency: ['VND', 'USD'],
    candidateStatus: ['Looking for a job', 'Already have a job'],
    guaranteeType: ['Bảo hành toàn diện', 'Bảo hành theo giai đoạn', 'Không bảo hành'],
    optionalFieldType: [
        "mail",
        "phone",
        "text",
        "integer",
        "float",
        "paragraph",
        "multiselect",
        "dropdownlist",
        "date"
    ],
    socialAccountMethod: ['facebook', 'google'],
    pathTmpOriginalCv: './assets/tmp_original/',
    pathTmpFixedCv: './assets/tmp_fixed/',
    pathOriginalCv: './assets/original_link_cv/',
    pathFixedCv: './assets/fixed_link_cv/',
    pathExcel: './assets/excel/',
    pathImagesTmp: './assets/images_tmp',
    pathImagesCompany: './assets/company_images/',
    pathImages: './assets/images/',
    pathImagesBank: './assets/bank_account_images/',
    pathIcons: './assets/icons',
    pathStaticFixedCv: '/static/cv/',
    pathStaticOriginalCv: '/static/original_cv/',
    reportBy: ['date', 'month', 'year']
}

export const InterviewStatus = {
    WAITING: 'waiting interview',
    INTERVIEWING: 'interviewing',
    CANCEL: 'cancel interview',
    SUCCESS: 'interview success',
    FAILED: 'interview failed'
}

export const IntroductionStatus = {
    PENDING: 'Pending',
    DECLINE: 'Employer Decline',
    EMPLOYER_ACCEPT: 'Employer Accept',
    VIEWED: 'Company Viewed',
    REJECT: 'Company Reject',
    COMPANY_ACCEPT: 'Company Accept',
    SEND_TEST: 'Send Test',
    SUBMIT_TEST: 'Candidate Submit Test',
    FAILED_TEST: 'Failed Test',
    PASSED_TEST: 'Passed Test',
    SCHEDULE: 'Schedule Interview',
    REJECT_INTERVIEW: 'Candidate Reject Interview',
    INTERVIEWED: 'Interviewed',
    FAILED_INTERVIEW: 'Failed Interview',
    OFFER: 'Offer',
    ONBOARD: 'Onboard',
    RESIGN: 'Resign',
    COMPLETED: 'Completed'
}

export const PaymentStatus = {
    WAITING: 'Waiting',
    PAYMENTCOMPLETED: 'Payment completed',
    PAYMENTFAILED: 'Payment failed'
    
}
export const JobGuarantee = {
    NOWARRANTY: 'Không bảo hành',
    PERIODICWARRANTY: 'Bảo hành theo giai đoạn',
    COMPREHENSIVEWARRANTY: 'Bảo hành toàn diện'
}

export const TAtatoolUrl = {
    STAFF_DETAIL: '/staff-detail?id=',
    REFER_CANDIDATE_DETAIL: '/refer-candidate-detail-collaborator?id=',
    INTERVIEW_DETAIL: '/interview-detail-for-collaborator?id=',
    PLACEMENT: '/manage-placement-for-collaborator'
}

export const NotifyIconUrl = {
    INTRODUCTION: '/static/icons/candidate_notification.png',
    INTERVIEW: '/static/icons/interview_notification.png',
    PLACEMENT: '/static/icons/placement_notification.png',
    STAFF: '/static/icons/staff_notification.png'
}

export const NotifyType = {
    REFER_CANDIDATE: 'Refer candidate',
    INTERVIEW: 'Interview',
    PLACEMENT: 'Placement',
    STAFF: 'Staff'
}

export const CollaboratorStatus = {
    APPROVAL: 'approval',
    LOCK: 'lock',
    DISABLE: 'disable',
    WAITING: 'waiting'
}

export const CandidateStatus = {
    LOOKINGJOB: 'Looking for a job',
    HADJOB: 'Already have a job'
}