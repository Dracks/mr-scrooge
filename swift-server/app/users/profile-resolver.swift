import Graphiti
import Vapor
import Fluent


extension MrScroogeResolver {
	func login(request req: Request, arguments: SessionTypes.LoginArgs) async throws -> SessionTypes.LoginResponse {
		var errorStr = ""
        let credentials = arguments.credentials
		do {
			let optionalUser = try await User.query(on: req.db)
				.filter(\.$username == credentials.username)
				.first()

			if let user = optionalUser, user.verifyPassword(pwd: credentials.password) {
				req.auth.login(user)
                try await user.$groups.load(on: req.db)
                try await user.$defaultGroup.load(on: req.db)
                return SessionTypes.MyProfile(user: user)
			}
			errorStr = "Invalid credentials"
		} catch {
			print(error)
			//self.app.logger.error("Some error happened \(error)")
			errorStr = "\(error)"
		}
        return SessionTypes.LoginError(error: errorStr)
	}

    func getCurrentUser(request req: Request, arguments: NoArguments) async throws -> SessionTypes.MyProfileResponse {
        do {
            let user = try await getUser(fromRequest: req)
            try await user.$groups.load(on: req.db)
            try await user.$defaultGroup.load(on: req.db)
            return SessionTypes.MyProfile(user: user)
        } catch is NotIdentifiedError {
            return SessionTypes.NotIdentified()
        }
        
    }

    func logout(request req: Request, arguments: NoArguments) async throws -> Bool {
        req.auth.logout(User.self)
        return true
    }
    
    func users(request req: Request, arguments: NoArguments) async throws -> [SessionTypes.MyProfile] {
        // todo, validate it's only for admins
        return try await User.query(on: req.db).all().map({return SessionTypes.MyProfile(user: $0)})
    }
    
}

// Define the necessary types in a namespace called Session
class SessionTypes {
    static let usersService = UsersService()
    
    class Schema:PartialSchema<MrScroogeResolver, Request> {
        @TypeDefinitions
        override var types: Types {
            Type(MyProfile.self) {
                Field("id", at: \.id)
                Field("username", at: \.username)
                Field("email", at: \.email)
                Field("isAdmin", at: \.isAdmin)
                Field("firstName", at: \.firstName)
                Field("lastName", at: \.lastName)
                Field("groups", at: \.groups)
                Field("defaultGroupId", at: \.defaultGroup.id)
                //Field("groups", at: MyProfile.groups)
            }
            
            Type(LoginError.self) {
                Field("error", at: \.error)
            }
            
            Type(GqlUserGroup.self){
                Field("id", at: \.id)
                Field("name", at: \.name)
            }
            Type(NotIdentified.self){
                Field("username", at: \.username)
            }
            
            Union(MyProfileResponse.self, members: MyProfile.self, NotIdentified.self)
            Union(LoginResponse.self, members: MyProfile.self, LoginError.self)
            
            Input(Credentials.self){
                InputField("username", at: \.username)
                InputField("password", at: \.password)
            }
        }
        
        @FieldDefinitions
        override var query: Fields {
            Field("me", at: MrScroogeResolver.getCurrentUser, as: MyProfileResponse.self)
            // Enable security before enable the next row
            // Field("users", at: MrScroogeResolver.users, as: [MyProfile].self)
        }
        
        @FieldDefinitions
        override var mutation: Fields {
            Field("login", at: MrScroogeResolver.login, as: LoginResponse.self) {
                Argument("credentials", at: \.credentials)
            }
            Field("logout", at: MrScroogeResolver.logout)
        }
    }

	
	struct Credentials: Content {
		let username: String
		let password: String
	}
    
    struct LoginArgs: Content {
        let credentials: Credentials
    }

    protocol LoginResponse {}
    
    struct LoginError: Content, LoginResponse {
        let error: String
    }
    
    struct MyProfile: Content, MyProfileResponse, LoginResponse {
        let id: UUID
        let username: String
        let email: String
        let firstName: String?
        let lastName: String?
        let isActive: Bool
        let isAdmin: Bool
        let groups: [GqlUserGroup]
        let defaultGroup: GqlUserGroup

        init(user: User) {
            self.id = user.id!
            self.username = user.username
            self.email = user.email
            self.firstName = user.firstName
            self.lastName = user.lastName
            self.isActive = user.isActive
            self.isAdmin = user.isAdmin
            self.groups = user.groups.map { GqlUserGroup(group: $0) }
            self.defaultGroup = GqlUserGroup(group: user.defaultGroup)
        }
        
        /*static func groups(req: Request, parent: MyProfile) async throws -> [GqlUserGroup] {
            return try await SessionTypes.usersService.getGroups(on: req.db, forUser: parent.id).map {
                return GqlUserGroup(group: $0)
            }
        }*/
    }
    
    struct GqlUserGroup: Content {
        let id: UUID
        let name: String

        init(group: UserGroup) {
            self.id = group.id!
            self.name = group.name
        }
    }
    
    struct NotIdentified: Content, MyProfileResponse {
        let username = "anonymous"
    }

    
    protocol MyProfileResponse {
        
    }
}

class UsersService {
    func getGroups(on db: Database, forUser userId: UUID) async throws -> [UserGroup] {
        return try await User.query(on: db).filter(\.$id == userId).with(\.$groups).all().flatMap { user in
            user.groups
        }
    }
}

