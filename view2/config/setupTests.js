/*const Enzyme = require("enzyme")
const EnzymeAdapter = require("enzyme-adapter-react-16")

Enzyme.configure({ adapter: new EnzymeAdapter() })
//*/
require('reflect-metadata')

jest.mock("../src/constants", () => ({
    GRAPHQL_URL: "/graphql/",
    LOGOUT_URL: "/logout",
    STATIC_URL: "",
}))
