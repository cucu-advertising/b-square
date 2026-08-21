import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/signup_flow_steps.dart';
import '../../providers/signup_flow_provider.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../widgets/onboarding/onboarding_text_field.dart';
import '../registration/account_credentials_screen.dart';

class NameScreen extends StatefulWidget {
  const NameScreen({super.key});

  @override
  State<NameScreen> createState() => _NameScreenState();
}

class _NameScreenState extends State<NameScreen> {
  late final TextEditingController _firstNameController;
  late final TextEditingController _lastNameController;

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    _firstNameController = TextEditingController(text: data.firstName);
    _lastNameController = TextEditingController(text: data.lastName);
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  bool get _isValid =>
      _firstNameController.text.trim().isNotEmpty &&
      _lastNameController.text.trim().isNotEmpty;

  void _continue() {
    if (!_isValid) return;

    final provider = context.read<SignupFlowProvider>();
    provider.update(() {
      provider.data.firstName = _firstNameController.text.trim();
      provider.data.lastName = _lastNameController.text.trim();
      provider.data.founderName = provider.data.fullName;
    });

    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const AccountCredentialsScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      title: "What's your name?",
      progressSegments: SignupFlowSteps.total,
      activeSegment: SignupFlowSteps.segmentIndex(SignupFlowSteps.name),
      onBack: () => Navigator.of(context).pop(),
      onNext: _continue,
      nextEnabled: _isValid,
      child: Column(
        children: [
          OnboardingTextField(
            label: 'First Name',
            controller: _firstNameController,
            autofocus: true,
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 16),
          OnboardingTextField(
            label: 'Last Name',
            controller: _lastNameController,
            onChanged: (_) => setState(() {}),
          ),
        ],
      ),
    );
  }
}
