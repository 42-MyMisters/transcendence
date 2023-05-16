import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/user/user.service";
import { TesterController } from "./tester.controller"
import { TesterService } from "./tester.service";

describe('TesterController', () => {
    let testerController: TesterController;
    let testerService: TesterService;
    let userService: UserService;
    let authService: AuthService;
    // let jwtService JwtService;

    beforeEach(() => {
        authService = new AuthService();
        userService = new UserService();
        testerService = new TesterService(userService, authService);
        testerController = new TesterController(testerService);
    });
    describe('findAll', () => {
        it('should return an array of tests', async () => {
            const result = ['test'];
            jest.spyOn(testerService, 'findAll').mockImplementation(() => result);
            expect(await testerController.findAll()).toBe(result);
        });
    });
});