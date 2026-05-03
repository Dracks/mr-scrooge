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
	let institutionName: String
	let iban: String?
	let ownerName: String?
	let status: String?
	let name: String?
}

struct GocardlessCredentialsPage: HTMLDocument {
	let hasCredentials: Bool

	var title = "GoCardLess - Credentials"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Credentials"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Unauthenticated.header
		main(.class("container")) {
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

struct GocardlessAccountsPage: HTMLDocument {
	let username: String
	let accounts: [AccountDetailView]
	let agreements: [UserAgreement]

	var title = "GoCardLess - Accounts"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Accounts"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
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
						form(
							.method(.post),
							.action(
								"/\(GocardlessAccountsController.path)/agreement/\(account.agreementId)/delete"
							)
						) {
							button(
								.type(.submit), .class("secondary"),
								.style("float: right;")
							) { "Delete" }
						}
					}
				}
			}

			a(.href("/\(GocardlessAccountsController.path)/add"), .role("button")) {
				"Add Account"
			}
			a(.href("/"), .role("button"), .class("secondary")) { "Back to Dashboard" }
		}
	}
}

struct GocardlessCountrySelectionPage: HTMLDocument {
	let username: String

	var title = "GoCardLess - Select Country"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Select Country"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
			h2 { "Select Country" }

			article {
				header { "Choose your bank's country" }
				p { "Select the country where your bank is located." }
			}

			form(
				.method(.get),
				.action("/\(GocardlessAccountsController.path)/add/institutions")
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

			a(
				.href("/\(GocardlessAccountsController.path)"), .role("button"),
				.class("secondary")
			) { "Cancel" }
		}
	}
}

struct GocardlessInstitutionsPage: HTMLDocument {
	let username: String
	let institutions: [InstitutionView]
	let country: String

	var title = "GoCardLess - Select Bank"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Select Bank"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
			h2 { "Select Bank" }

			p { "Showing banks for country: \(country)" }

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
				.href("/\(GocardlessAccountsController.path)/add"), .role("button"),
				.class("secondary")
			) { "Back to Country Selection" }
			a(
				.href("/\(GocardlessAccountsController.path)"), .role("button"),
				.class("secondary")
			) { "Cancel" }
		}
	}
}

struct GocardlessCallbackPage: HTMLDocument {
	let username: String
	let ref: String
	let agreementFound: Bool
	let institutionName: String?

	var title = "GoCardLess - Bank Connected"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Bank Connected"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
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
				.href(
					"/\(GocardlessAccountsController.path)/\(UserAgreementsController.path)"
				), .role("button")
			) { "View Agreements" }
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

struct UserAgreementsListPage: HTMLDocument {
	let username: String
	let agreements: [UserAgreement]
	let existingAccountIds: Set<String>

	var title = "GoCardLess - Agreements"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Agreements"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
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
										"/\(GocardlessAccountsController.path)/\(UserAgreementsController.path)/\(agreement.id?.uuidString ?? "")/add-accounts"
									), .role("button"),
									.class("outline")
								) { "Add Account" }
							}
							form(
								.method(.post),
								.action(
									"/\(GocardlessAccountsController.path)/\(UserAgreementsController.path)/\(agreement.id?.uuidString ?? "")/delete"
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
				.href("/\(GocardlessAccountsController.path)"), .role("button"),
				.class("secondary")
			) { "Back to Accounts" }
		}
	}
}

struct SelectAccountsPage: HTMLDocument {
	let username: String
	let agreement: UserAgreement
	let accounts: [AvailableAccountView]
	let existingAccountIds: Set<String>

	var title = "GoCardLess - Select Accounts"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Select Accounts"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
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
						"/\(GocardlessAccountsController.path)/\(UserAgreementsController.path)/\(agreement.id?.uuidString ?? "")/add-accounts"
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
					"/\(GocardlessAccountsController.path)/\(UserAgreementsController.path)"
				), .role("button"), .class("secondary")
			) { "Back to Agreements" }
		}
	}
}

struct GocardlessAccountsCreatedPage: HTMLDocument {
	let username: String
	let institutionName: String
	let redirectUrl: String

	var title = "GoCardLess - Redirect"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Redirect"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
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
