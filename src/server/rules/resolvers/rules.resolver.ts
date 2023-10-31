import { ObjectType, Resolver } from '@nestjs/graphql';

@ObjectType()
export class Rule {}

@Resolver(() => Rule)
export class RuleResolver {}
