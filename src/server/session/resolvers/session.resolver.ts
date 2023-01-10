
import * as secureSession from '@fastify/secure-session'
import { Logger } from '@nestjs/common'
import { Args, Context, createUnionType, Field, InputType, Mutation, ObjectType,Query, Resolver } from '@nestjs/graphql';

import { CustomError, ensureOrThrow } from '../../core/errors/base-error';
import { MyProfile } from '../gql-objects/my-profile.object';
import { AllowRoles, Role } from '../guard/roles.decorator'
import { UserProfileService } from '../user-profile.service';


@InputType()
export class LoginArgs {
	@Field(() => String)
	username!: string;

	@Field(() => String)
	password!: string;
}

@ObjectType()
export class InvalidCredentials {
	@Field()
	invalidUserOrPassword!: string;
}

@ObjectType()
export class NotIdentified {
	@Field()
	identified!: false
}

const LoginResponse = createUnionType({
	name: 'LoginResponse',
	types: () => [MyProfile, InvalidCredentials],
	resolveType(value) {
		if (value.email || value.username) {
			return MyProfile;
		}
		return InvalidCredentials;
	}
})

const MyProfileResponse = createUnionType({
	name: 'MyProfileResponse',
	types: () => [MyProfile, NotIdentified],
	resolveType(value) {
		if (value.identified === false) {
			return NotIdentified
		}
		return MyProfile
	}
})

@Resolver()
export class SessionResolver {
	private readonly logger = new Logger(this.constructor.name)

	constructor(
		private readonly userService: UserProfileService) { }

	@Query(returns => MyProfileResponse, { name: 'me', description: 'Checks if a user is logged in and returns his profile' })
	@AllowRoles(Role.GUEST)
	async getCurrentUser(@Context('session') session: secureSession.Session): Promise<MyProfile|NotIdentified> {

		// this.logger.log(session, 'get_current_user');
		const userId = session.get('userId');
		this.logger.warn({userId}, 'USER ID')
		if (userId > 0) {
			const user = await this.userService.getUserProfile(userId);
			return ensureOrThrow(user, new CustomError('ER0000', 'User not found', {userId} ));
		}
		return {identified: false};
	}

	@Mutation(() => LoginResponse)
	@AllowRoles(Role.GUEST)
	async login(
		@Context('session') session: secureSession.Session,
		@Args('credentials') credentials: LoginArgs,
	) {
		this.logger.log({ session, credentials }, 'session')
		const user = await this.userService.validateUser(credentials.username, credentials.password)
		this.logger.log({ user }, 'user')
		if (user) {
			session.set('userId', user.id)
			return user
		}
		return {
			invalidUserOrPassword: credentials.username,
		}
	}

	@Mutation(() => Boolean)
	async logout(@Context('session') session: secureSession.Session): Promise<boolean> {
		session.delete();
		return true;
	}
}