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
    ]
}

export const InterviewStatus = {
    WAITING: 'waiting interview',
    INTERVIEWING: 'interviewing',
    CANCEL: 'cancel interview',
    SUCCESS: 'interview success',
    FAILED: 'interview failed'
}

