import { CredentialRepository } from "#Types/credential-repository.type";

export default class CredentialService {
  constructor(
    private credentialRepository: CredentialRepository
  ) {}
}