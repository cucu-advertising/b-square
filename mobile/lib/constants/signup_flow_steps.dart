/// Linear signup flow — 9 steps with shared progress bar.
abstract final class SignupFlowSteps {
  static const total = 9;

  static const name = 1;
  static const account = 2;
  static const profileImage = 3;
  static const verification = 4;
  static const business = 5;
  static const aboutYou = 6;
  static const businessGoals = 7;
  static const connectWith = 8;
  static const interests = 9;

  static int segmentIndex(int step) => step - 1;
}
