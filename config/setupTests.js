

vi.mock(import("../src/react-view/constants"), () => ({
    LOGOUT_URL: "/logout",
    STATIC_URL: "",
    DEBUG: false,
    VERSION: "test"
}))
