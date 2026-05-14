import Elementary
import VaporElementary

struct InstitutionView: Codable {
	let id: String
	let name: String
	let bic: String
	let countries: [String]
}

struct AccountDetailView: Codable {
	let agreementId: String
	let accountId: String
	let institutionName: String
	let iban: String?
	let ownerName: String?
	let status: String?
	let name: String?
}

struct GocardlessCredentialsPage: HTML {
	let hasCredentials: Bool

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Credentials") {
			Header.Unauthenticated.header
		} content: {
			h2 { "GoCardless API Credentials" }

			if hasCredentials {
				article {
					header { "Credentials Configured" }
					p { "Your GoCardless API credentials are configured." }
				}
			} else {
				article {
					header { "Configure Credentials" }
					p {
						"To use the GoCardless importer, you need to configure your API credentials. "
						"You can get these from your GoCardless dashboard."
					}
				}
			}

			form(.method(.post), .action("/\(GocardlessKeysController.path)")) {
				label {
					"Secret ID"
					input(.type(.text), .name("secretId"), .required)
				}
				label {
					"Secret Key"
					input(.type(.password), .name("secretKey"), .required)
				}
				button(.type(.submit)) { "Save Credentials" }
			}

			a(.href("/"), .role("button"), .class("secondary")) { "Back to Dashboard" }
		}
	}
}

struct GocardlessCredentialsRequiredPage: HTML {
	let username: String

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Credentials Required") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "GoCardless API Credentials Required" }
			article {
				header { "Credentials Not Configured" }
				p {
					"You need to configure your GoCardless API credentials before using this feature."
				}
				a(.href("/\(GocardlessKeysController.path)"), .role("button")) {
					"Configure Credentials"
				}
			}
			a(.href("/"), .role("button"), .class("secondary")) { "Back to Dashboard" }
		}
	}
}

struct GocardlessAccountsPage: HTML {
	let username: String
	let accounts: [AccountDetailView]
	let agreements: [UserAgreement]

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Accounts") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "Bank Accounts" }

			if accounts.isEmpty {
				article {
					header { "No Bank Accounts Connected" }
					p {
						"Connect your bank account to start importing transactions."
					}
				}
			} else {
				h3 { "Connected Accounts" }
				for account in accounts {
					article {
						header { account.institutionName }
						p {
							if let name = account.name {
								"\(name) - "
							}
							if let iban = account.iban {
								"IBAN: \(iban)"
							}
						}
						if let owner = account.ownerName {
							p { "Owner: \(owner)" }
						}
						if let status = account.status {
							footer {
								"Status: \(status)"
							}
						}
						div(
							.style(
								"display: flex; gap: 0.5rem; margin-top: 0.5rem; justify-content: flex-end;")
						) {
							form(
								.method(.post),
								.action(
									"/\(GocardlessAccountsController.path)/\(account.agreementId)/download-transactions"
								)
							) {
								button(
									.type(.submit), .class("outline"),
									.style("font-size: 0.85rem;")
								) { "Download Transactions" }
							}
							form(
								.method(.post),
								.action(
									"/\(InstitutionsController.path)/\(account.agreementId)/delete"
								)
							) {
								button(
									.type(.submit), .class("secondary"),
									.style("font-size: 0.85rem;")
								) { "Delete" }
							}
						}
					}
				}
			}

			a(.href("/\(InstitutionsController.path)/add"), .role("button")) {
				"Add Account"
			}
			a(.href("/"), .role("button"), .class("secondary")) { "Back to Dashboard" }
		}
	}
}

struct GocardlessInstitutionsPage: HTML {
	let username: String
	let institutions: [InstitutionView]?
	let country: String?

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Select Institution") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { country == nil ? "Select Country" : "Select Bank" }

			if let country, let institutions {
				if institutions.isEmpty {
					article {
						header { "No Banks Available" }
						p { "No banks are available for the selected country." }
					}
				} else {
					form(
						.method(.post),
						.action("/\(GocardlessAccountsController.path)/create")
					) {
						label {
							"Select your bank"
							select(.name("institutionId"), .required) {
								option(.value(""), .disabled, .selected) {
									"-- Select a bank --"
								}
								for institution in institutions {
									option(.value(institution.id)) {
										"\(institution.name) (\(institution.bic))"
									}
								}
							}
						}
						button(.type(.submit)) { "Connect Bank" }
					}
				}

				a(
					.href("/\(InstitutionsController.path)/add"), .role("button"),
					.class("secondary")
				) { "Back to Country Selection" }
			} else {
				article {
					header { "Choose your bank's country" }
					p { "Select the country where your bank is located." }
				}

				form(
					.method(.get),
					.action("/\(InstitutionsController.path)/add")
				) {
					label {
						"Country"
						select(.name("country"), .required) {
							option(.value(""), .disabled, .selected) {
								"-- Select a country --"
							}
							option(.value("AT")) { "Austria" }
							option(.value("BE")) { "Belgium" }
							option(.value("BG")) { "Bulgaria" }
							option(.value("HR")) { "Croatia" }
							option(.value("CY")) { "Cyprus" }
							option(.value("CZ")) { "Czech Republic" }
							option(.value("DK")) { "Denmark" }
							option(.value("EE")) { "Estonia" }
							option(.value("FI")) { "Finland" }
							option(.value("FR")) { "France" }
							option(.value("DE")) { "Germany" }
							option(.value("GR")) { "Greece" }
							option(.value("HU")) { "Hungary" }
							option(.value("IS")) { "Iceland" }
							option(.value("IE")) { "Ireland" }
							option(.value("IT")) { "Italy" }
							option(.value("LV")) { "Latvia" }
							option(.value("LT")) { "Lithuania" }
							option(.value("LU")) { "Luxembourg" }
							option(.value("MT")) { "Malta" }
							option(.value("NL")) { "Netherlands" }
							option(.value("NO")) { "Norway" }
							option(.value("PL")) { "Poland" }
							option(.value("PT")) { "Portugal" }
							option(.value("RO")) { "Romania" }
							option(.value("SK")) { "Slovakia" }
							option(.value("SI")) { "Slovenia" }
							option(.value("ES")) { "Spain" }
							option(.value("SE")) { "Sweden" }
							option(.value("GB")) { "United Kingdom" }
						}
					}
					button(.type(.submit)) { "Continue" }
				}
			}

			a(
				.href("/\(GocardlessAccountsController.path)"), .role("button"),
				.class("secondary")
			) { "Back to Accounts" }
		}
	}
}

struct GocardlessAddAccountPage: HTML {
	let username: String
	let approvedAgreements: [UserAgreement]

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Add Account") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "Add Account" }

			if approvedAgreements.isEmpty {
				article {
					header { "No Active Agreements" }
					p {
						"You don't have any active bank agreements. "
						"Add a new institution to get started."
					}
				}
			} else {
				h3 { "Existing Agreements" }
				p { "Select an institution to add accounts from:" }

				for agreement in approvedAgreements {
					article {
						header { agreement.institutionName }
						footer {
							"Status: \(agreement.status)"
						}
						a(
							.href(
								"/\(InstitutionsController.path)/\(agreement.id?.uuidString ?? "")/add-accounts"
							), .role("button"), .class("outline")
						) { "Add Accounts" }
					}
				}
			}

			hr()

			h3 { "Add New Institution" }
			a(.href("/\(InstitutionsController.path)/add/new"), .role("button")) {
				"Connect New Bank"
			}

			a(
				.href("/\(GocardlessAccountsController.path)"), .role("button"),
				.class("secondary")
			) { "Back to Accounts" }
		}
	}
}

struct AvailableAccountView: Codable {
	let accountId: String
	let iban: String
	let ownerName: String?
	let name: String?
	let status: String
}

struct UserAgreementsListPage: HTML {
	let username: String
	let agreements: [UserAgreement]
	let existingAccountIds: Set<String>

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Agreements") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "User Agreements" }

			if agreements.isEmpty {
				article {
					header { "No Agreements" }
					p { "You haven't created any bank agreements yet." }
				}
			} else {
				for agreement in agreements {
					article {
						header { agreement.institutionName }
						p { "Agreement ID: \(agreement.agreementId)" }
						p { "Requisition: \(agreement.requisitionId)" }
						footer {
							"Status: \(agreement.status)"
						}
						div(
							.style(
								"display: flex; gap: 0.5rem; margin-top: 0.5rem;"
							)
						) {
							if agreement.status == "approved" {
								a(
									.href(
										"/\(InstitutionsController.path)/\(agreement.id?.uuidString ?? "")/add-accounts"
									), .role("button"),
									.class("outline")
								) { "Add Account" }
							}
							form(
								.method(.post),
								.action(
									"/\(InstitutionsController.path)/\(agreement.id?.uuidString ?? "")/delete"
								)
							) {
								button(
									.type(.submit),
									.class("secondary"),
									.style("float: right;")
								) { "Delete" }
							}
						}
					}
				}
			}

			a(
				.href("/\(InstitutionsController.path)"), .role("button"),
				.class("secondary")
			) { "Back to Accounts" }
		}
	}
}

struct GocardlessCallbackPage: HTML {
	let username: String
	let ref: String
	let agreementFound: Bool
	let institutionName: String?

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Bank Connected") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "Bank Connection Complete" }

			article {
				header { "Reference: \(ref)" }
				p {
					if agreementFound {
						if let institutionName {
							"Your bank agreement for \(institutionName) has been approved and is now active."
						} else {
							"Your bank agreement has been approved and is now active."
						}
					} else {
						"Your bank connection has been initiated. "
						"The agreement will be processed shortly."
					}
				}
			}

			a(
				.href("/\(InstitutionsController.path)"), .role("button")
			) { "View Agreements" }
			a(
				.href("/\(GocardlessAccountsController.path)"), .role("button"),
				.class("secondary")
			) { "Back to Accounts" }
		}
	}
}

struct SelectAccountsPage: HTML {
	let username: String
	let agreement: UserAgreement
	let accounts: [AvailableAccountView]
	let existingAccountIds: Set<String>

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Select Accounts") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "Select Bank Accounts" }

			article {
				header { agreement.institutionName }
				p { "Select one or more accounts to add from this agreement." }
			}

			if accounts.isEmpty {
				article {
					header { "No Accounts Available" }
					p { "No accounts are available for this agreement yet." }
				}
			} else {
				form(
					.method(.post),
					.action(
						"/\(InstitutionsController.path)/\(agreement.id?.uuidString ?? "")/add-accounts"
					)
				) {
					for account in accounts {
						let isExisting = existingAccountIds.contains(
							account.accountId)
						div(
							.style(
								"margin: 0.5rem 0; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
							)
						) {
							label(
								.style(
									"display: flex; align-items: center; gap: 0.5rem; cursor: \(isExisting ? "not-allowed" : "pointer"); opacity: \(isExisting ? "0.5" : "1");"
								)
							) {
								if isExisting {
									input(
										.type(.checkbox),
										.name("accountIds"),
										.value(
											account
												.accountId
										), .disabled)
								} else {
									input(
										.type(.checkbox),
										.name("accountIds"),
										.value(
											account
												.accountId
										), .checked)
								}
								div {
									strong { account.iban }
									if let name = account.name {
										br()
										span(
											.style(
												"font-size: 0.9em; color: #666;"
											)
										) { name }
									}
									if let owner = account
										.ownerName
									{
										br()
										span(
											.style(
												"font-size: 0.9em; color: #666;"
											)
										) {
											"Owner: \(owner)"
										}
									}
									if isExisting {
										br()
										span(
											.style(
												"font-size: 0.85em; color: #2196F3; font-weight: bold;"
											)
										) {
											"Already added"
										}
									}
								}
							}
						}
					}
					button(.type(.submit)) { "Add Selected Accounts" }
				}
			}

			a(
				.href(
					"/\(InstitutionsController.path)"
				), .role("button"), .class("secondary")
			) { "Back to Agreements" }
		}
	}
}

struct GocardlessAccountsCreatedPage: HTML {
	let username: String
	let institutionName: String
	let redirectUrl: String

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Redirect") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "Redirecting to Bank" }

			article {
				header { "Connecting to \(institutionName)" }
				p {
					"You are being redirected to your bank to complete the authentication. "
					"If you are not redirected automatically, "
					a(.href(redirectUrl)) { "click here to continue" }
					"."
				}
			}

			a(
				.href("/\(GocardlessAccountsController.path)"), .role("button"),
				.class("secondary")
			) { "Cancel" }
		}
	}
}
