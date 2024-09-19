import "reflect-metadata"
import { Container } from "inversify"
import { TYPES } from "./types"
import { IUserRepository, UserRepository } from "./repositories/user.repository"
import { UserModel } from "./entities/user"
import { IUserService, UserService } from "./controllers/services/user.service"
import { Token } from "./JwtToken/JwtToken"
import { IPostRepository, PostRepository } from "./repositories/post.repository"
import { PostModel } from "./entities/post"
import { IPostService, PostService } from "./controllers/services/post.service"
import { BankAccountService, IBankAccountService } from "./controllers/services/bank_account.service"
import { BankAccountRepository, IBankAccountRepository } from "./repositories/bank_account.repository"
import { BankAccountModel } from "./entities/bank_account"
import { ISavePostService, SavePostService } from "./controllers/services/save_post.service"
import { ISavedPostRepository, SavedPostRepository } from "./repositories/saved_post.repository"
import { SavePostModel } from "./entities/save_post"
import { IJobRoleRepository, JobRoleRepository } from "./repositories/job_role.repository"
import { JobRoleModel } from "./entities/job_role"
import { IIndustryRepository, IndustryRepository } from "./repositories/industry.repository"
import { IndustryModel } from "./entities/industry"
import { FunctionRepository, IFunctionRepository } from "./repositories/function.repository"
import { FunctionModel } from "./entities/function"
import { IJobRepository, JobRepository } from "./repositories/job.repository"
import { JobModel } from "./entities/job"
import { CityRepository, ICityRepository } from "./repositories/city.repository"
import { CityModel } from "./entities/city"
import { CountryRepository, ICountryRepository } from "./repositories/country.repository"
import { CountryModel } from "./entities/country"
import { ISkillRepository, SkillRepository } from "./repositories/skill.repository"
import { SkillModel } from "./entities/skill"
import { IIndustryService, IndustryService } from "./controllers/services/industry.service"
import { CandidateRepository, ICandidateRepository } from "./repositories/candidate.repository"
import { CandidateModel } from "./entities/candidate"
import { CompanyRepository, ICompanyRepository } from "./repositories/company.repository"
import { CompanyModel } from "./entities/company"
import { ILanguageRepository, LanguageRepository } from "./repositories/language.repository"
import { LanguageModel } from "./entities/language"
import { CandidateService, ICandidateService } from "./controllers/services/candidate.service"
import { CompanyService, ICompanyService } from "./controllers/services/company.service"
import { IJobRoleService, JobRoleService } from "./controllers/services/job_role.service"
import { CommentRepository, ICommentRepository } from "./repositories/comment.repository"
import { CommentModel } from "./entities/comment"
import { ISkillService, SkillService } from "./controllers/services/skill.service"
import { ILanguageService, LanguageService } from "./controllers/services/language.service"
import { CommentService, ICommentService } from "./controllers/services/comment.service"
import { CityService, ICityService } from "./controllers/services/city.service"
import { CandidateIntroductionService, ICandidateIntroductionService } from "./controllers/services/candidate_introduction.service"
import { CandidateIntroductionRepository, ICandidateIntroductionRepository } from "./repositories/candidate_introduction.repository"
import { CandidateIntroductionModel } from "./entities/candidate_introduction"
import { FileRepository, IFileRepository } from "./repositories/file.repository"
import { FileModel } from "./entities/file"
import { IInterviewService, InterviewService } from "./controllers/services/interview.service"
import { MailService } from "./mail.service"
import { IOptionalFieldRepository, OptionalFieldRepository } from "./repositories/optional_field.repository"
import { OptionalFieldModel } from "./entities/optional_field"
import { InterviewModel } from "./entities/interview"
import { IInterviewRepository, InterviewRepository } from "./repositories/interview.repository"
import { IInterviewScheduleService, InterviewScheduleService } from "./controllers/services/interview_schedule.service"
import { InterviewScheduleModel } from "./entities/interview_schedule"
import { IInterviewScheduleRepository, InterviewScheduleRepository } from "./repositories/interview_schedule.repository"
import { IOptionalFieldValueRepository, OptionalFieldValueRepository } from "./repositories/optional_field_value.repository"
import { OptionalFieldsValueModel } from "./entities/optional_fields_value"
import { IPdfHandler, PdfHandler } from "./FileHandle/PdfHandler"
import { IJobService, JobService } from "./controllers/services/job.service"
import { FunctionService, IFunctionService } from "./controllers/services/function.service"
import { CandidateSkillRepository, ICandidateSkillRepository } from "./repositories/candidate_skill.repository"
import { CandidateSkillModel } from "./entities/candidate_skill"
import { DocxHandler, IDocxHandler } from "./FileHandle/DocxHandler"
import { CandidateWorkExperienceRepository, ICandidateWorkExperienceRepository } from "./repositories/work_experience.repository"
import { WorkExperienceModel } from "./entities/work_experience"
import { CandidateLanguageRepository, ICandidateLanguageRepository } from "./repositories/candidate_language.repository"
import { CandidateLanguageModel } from "./entities/candidate_language"
import { IOptionalFieldService, OptionalFieldService } from "./controllers/services/optional_field.service"
import { CandidateIntroductionStatusHistoryModel } from "./entities/candidate_introduction_status_history"
import { CandidateIntroductionStatusHistoryRepository, ICandidateIntroductionStatusHistoryRepository } from "./repositories/candidate_introduction_status_history.repository"
import { HtmlHandler, IHtmlHandler } from "./FileHandle/HtmlHandler"
import { InterviewScheduleQuestionModel } from "./entities/interview_schedule_question"
import { IInterviewScheduleQuestionRepository, InterviewScheduleQuestionRepository } from "./repositories/interview_schedule_question.repository"
import { IPermissionRepository, PermissionRepository } from "./repositories/permission.repository"
import { PermissionModel } from "./entities/permission"
import { InviteTestService } from "./invite_test.service"
import { InterviewScheduleStatusHistoryModel } from "./entities/interview_schedule_status_history"
import { IInterviewScheduleStatusHistoryRepository, InterviewScheduleStatusHistoryRepository } from "./repositories/interview_schedule_status_history.repository"
import { IPermissionService, PermissionService } from "./controllers/services/permission.service"
import { IInterviewScheduleStatusHistoryService, InterviewScheduleStatusHistoryService } from "./controllers/services/interview_schedule_status_history.service"
import { IPlacementRepository, PlacementRepository } from "./repositories/placement.repository"
import { PlacementModel } from "./entities/placement"
import { IWarrantyRepository, WarrantyRepository } from "./repositories/warranty.repository"
import { WarrantyModel } from "./entities/warranty"
import { IPlacementService, PlacementService } from "./controllers/services/placement.service"
import { IWarrantyService, WarrantyService } from "./controllers/services/warranty.service"
import { INotificationService, NotificationService } from "./controllers/services/notification.service"
import { NotificationModel } from "./entities/notification"
import { INotificationRepository, NotificationRepository } from "./repositories/notification.repository"
import { CandidateIntroductionTestModel } from "./entities/candidate_introduction_test"
import { CandidateIntroductionTestRepository, ICandidateIntroductionTestRepository } from "./repositories/candidate_introduction_test_repository"


const myContainer = new Container();
//register service
myContainer.bind<IIndustryService>(TYPES.IIndustryService).to(IndustryService)
myContainer.bind<IBankAccountService>(TYPES.IBankAccountService).to(BankAccountService)
myContainer.bind<ISavePostService>(TYPES.ISavePostService).to(SavePostService)
myContainer.bind<IUserService>(TYPES.IUserService).to(UserService)
myContainer.bind<IPostService>(TYPES.IPostService).to(PostService)
myContainer.bind<ICandidateService>(TYPES.ICandidateService).to(CandidateService)
myContainer.bind<ICompanyService>(TYPES.ICompanyService).to(CompanyService)
myContainer.bind<IJobRoleService>(TYPES.IJobRoleService).to(JobRoleService)
myContainer.bind<ISkillService>(TYPES.ISkillService).to(SkillService)
myContainer.bind<ILanguageService>(TYPES.ILanguageService).to(LanguageService)
myContainer.bind<ICommentService>(TYPES.ICommentService).to(CommentService)
myContainer.bind<ICityService>(TYPES.ICityService).to(CityService)
myContainer.bind<IInterviewService>(TYPES.IInterviewService).to(InterviewService)
myContainer.bind<IInterviewScheduleService>(TYPES.IInterviewScheduleService).to(InterviewScheduleService)
myContainer.bind<ICandidateIntroductionService>(TYPES.ICandidateIntroductionService).to(CandidateIntroductionService)
myContainer.bind<IJobService>(TYPES.IJobService).to(JobService)
myContainer.bind<IFunctionService>(TYPES.IFunctionService).to(FunctionService)
myContainer.bind<IOptionalFieldService>(TYPES.IOptionalFieldService).to(OptionalFieldService)
myContainer.bind<IPermissionService>(TYPES.IPermissionService).to(PermissionService)
myContainer.bind<IInterviewScheduleStatusHistoryService>(TYPES.IInterviewScheduleStatusHistoryService).to(InterviewScheduleStatusHistoryService)
myContainer.bind<IPlacementService>(TYPES.IPlacementService).to(PlacementService)
myContainer.bind<IWarrantyService>(TYPES.IWarrantyService).to(WarrantyService)
myContainer.bind<INotificationService>(TYPES.INotificationService).to(NotificationService)

//register repository
myContainer.bind<IUserRepository>(TYPES.IUserRepository).toConstantValue(new UserRepository(UserModel))
myContainer.bind<IPostRepository>(TYPES.IPostRepository).toConstantValue(new PostRepository(PostModel))
myContainer.bind<IBankAccountRepository>(TYPES.IBankAccountRepository).toConstantValue(new BankAccountRepository(BankAccountModel))
myContainer.bind<ISavedPostRepository>(TYPES.ISavedPostRepository).toConstantValue(new SavedPostRepository(SavePostModel))
myContainer.bind<IJobRoleRepository>(TYPES.IJobRoleRepository).toConstantValue(new JobRoleRepository(JobRoleModel))
myContainer.bind<ISkillRepository>(TYPES.ISkillRepository).toConstantValue(new SkillRepository(SkillModel))
myContainer.bind<IIndustryRepository>(TYPES.IIndustryRepository).toConstantValue(new IndustryRepository(IndustryModel))
myContainer.bind<IFunctionRepository>(TYPES.IFunctionRepository).toConstantValue(new FunctionRepository(FunctionModel))
myContainer.bind<IJobRepository>(TYPES.IJobRepository).toConstantValue(new JobRepository(JobModel))
myContainer.bind<ICityRepository>(TYPES.ICityRepository).toConstantValue(new CityRepository(CityModel))
myContainer.bind<ICountryRepository>(TYPES.ICountryRepository).toConstantValue(new CountryRepository(CountryModel))
myContainer.bind<ICandidateRepository>(TYPES.ICandidateRepository).toConstantValue(new CandidateRepository(CandidateModel))
myContainer.bind<ICompanyRepository>(TYPES.ICompanyRepository).toConstantValue(new CompanyRepository(CompanyModel))
myContainer.bind<ILanguageRepository>(TYPES.ILanguageRepository).toConstantValue(new LanguageRepository(LanguageModel))
myContainer.bind<ICommentRepository>(TYPES.ICommentRepository).toConstantValue(new CommentRepository(CommentModel))
myContainer.bind<ICandidateIntroductionRepository>(TYPES.ICandidateIntroductionRepository).toConstantValue(new CandidateIntroductionRepository(CandidateIntroductionModel))
myContainer.bind<IFileRepository>(TYPES.IFileRepository).toConstantValue(new FileRepository(FileModel))
myContainer.bind<IOptionalFieldRepository>(TYPES.IOptionalFieldRepository).toConstantValue(new OptionalFieldRepository(OptionalFieldModel))
myContainer.bind<IInterviewRepository>(TYPES.IInterviewRepository).toConstantValue(new InterviewRepository(InterviewModel))
myContainer.bind<IOptionalFieldValueRepository>(TYPES.IOptionalFieldValueRepository).toConstantValue(new OptionalFieldValueRepository(OptionalFieldsValueModel))
myContainer.bind<IInterviewScheduleRepository>(TYPES.IInterviewScheduleRepository).toConstantValue(new InterviewScheduleRepository(InterviewScheduleModel))
myContainer.bind<ICandidateSkillRepository>(TYPES.ICandidateSkillRepository).toConstantValue(new CandidateSkillRepository(CandidateSkillModel))
myContainer.bind<ICandidateWorkExperienceRepository>(TYPES.ICandidateWorkExperienceRepository).toConstantValue(new CandidateWorkExperienceRepository(WorkExperienceModel))
myContainer.bind<ICandidateLanguageRepository>(TYPES.ICandidateLanguageRepository).toConstantValue(new CandidateLanguageRepository(CandidateLanguageModel))
myContainer.bind<ICandidateIntroductionStatusHistoryRepository>(TYPES.ICandidateIntroductionStatusHistoryRepository).toConstantValue(new CandidateIntroductionStatusHistoryRepository(CandidateIntroductionStatusHistoryModel))
myContainer.bind<IInterviewScheduleQuestionRepository>(TYPES.IInterviewScheduleQuestionRepository).toConstantValue(new InterviewScheduleQuestionRepository(InterviewScheduleQuestionModel))
myContainer.bind<IPermissionRepository>(TYPES.IPermissionRepository).toConstantValue(new PermissionRepository(PermissionModel))
myContainer.bind<IInterviewScheduleStatusHistoryRepository>(TYPES.IInterviewScheduleStatusHistoryRepository).toConstantValue(new InterviewScheduleStatusHistoryRepository(InterviewScheduleStatusHistoryModel))
myContainer.bind<IPlacementRepository>(TYPES.IPlacementRepository).toConstantValue(new PlacementRepository(PlacementModel))
myContainer.bind<IWarrantyRepository>(TYPES.IWarrantyRepository).toConstantValue(new WarrantyRepository(WarrantyModel))
myContainer.bind<INotificationRepository>(TYPES.INotificationRepository).toConstantValue(new NotificationRepository(NotificationModel))
myContainer.bind<ICandidateIntroductionTestRepository>(TYPES.ICandidateIntroductionTestRepository).toConstantValue(new CandidateIntroductionTestRepository(CandidateIntroductionTestModel))

//register common service
myContainer.bind<Token>(TYPES.Token).to(Token)
myContainer.bind<MailService>(TYPES.MailService).to(MailService)
myContainer.bind<InviteTestService>(TYPES.InviteTestService).to(InviteTestService)
myContainer.bind<IPdfHandler>(TYPES.IPdfHandler).to(PdfHandler)
myContainer.bind<IDocxHandler>(TYPES.IDocxHandler).to(DocxHandler)
myContainer.bind<IHtmlHandler>(TYPES.IHtmlHandler).to(HtmlHandler)

export { myContainer };