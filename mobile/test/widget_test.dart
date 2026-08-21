import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile/main.dart';
import 'package:mobile/providers/signup_flow_provider.dart';

void main() {
  testWidgets('Welcome screen shows sign in options', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => SignupFlowProvider(),
        child: const BSquareApp(),
      ),
    );

    expect(find.text('Sign in with LinkedIn'), findsOneWidget);
    expect(find.text('More options'), findsOneWidget);
  });
}
