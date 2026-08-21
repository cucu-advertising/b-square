import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/signup_flow_provider.dart';
import '../../widgets/onboarding/onboarding_dropdown_field.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../widgets/onboarding/onboarding_text_field.dart';
import '../../constants/signup_flow_steps.dart';
import '../onboarding/profile_onboarding_step_screen.dart';

class BusinessInfoScreen extends StatefulWidget {
  const BusinessInfoScreen({super.key});

  @override
  State<BusinessInfoScreen> createState() => _BusinessInfoScreenState();
}

class _BusinessInfoScreenState extends State<BusinessInfoScreen> {
  late final TextEditingController _businessController;
  late final TextEditingController _bioController;
  String _industry = '';
  String _city = '';
  String? _error;

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    _businessController = TextEditingController(text: data.businessName);
    _bioController = TextEditingController(text: data.bio);
    _industry = data.industry;
    _city = data.city;
  }

  @override
  void dispose() {
    _businessController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  bool get _isValid =>
      _businessController.text.trim().isNotEmpty && _city.isNotEmpty;

  void _continue() {
    if (!_isValid) {
      setState(() => _error = 'Business name and city are required');
      return;
    }

    final provider = context.read<SignupFlowProvider>();
    provider.update(() {
      provider.data.businessName = _businessController.text.trim();
      provider.data.companyName = _businessController.text.trim();
      provider.data.industry = _industry;
      provider.data.city = _city;
      provider.data.bio = _bioController.text.trim();
    });

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const ProfileOnboardingStepScreen(
          step: SignupFlowSteps.aboutYou,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      title: 'Tell us about your business',
      subtitle: 'Verified business professionals only',
      progressSegments: SignupFlowSteps.total,
      activeSegment: SignupFlowSteps.segmentIndex(SignupFlowSteps.business),
      onBack: () => Navigator.of(context).pop(),
      onNext: _continue,
      nextEnabled: _isValid,
      child: SingleChildScrollView(
        child: Column(
          children: [
            OnboardingTextField(
              label: 'Business Name *',
              controller: _businessController,
              hint: 'e.g. Ravi Textiles Pvt. Ltd.',
              onChanged: (_) => setState(() => _error = null),
            ),
            const SizedBox(height: 16),
            OnboardingDropdownField(
              label: 'Industry',
              value: _industry,
              hint: 'Select industry',
              options: AppConstants.industries,
              onChanged: (value) => setState(() => _industry = value ?? ''),
            ),
            const SizedBox(height: 16),
            OnboardingDropdownField(
              label: 'City *',
              value: _city,
              hint: 'Select city',
              options: AppConstants.cities.keys.toList(),
              onChanged: (value) => setState(() {
                _city = value ?? '';
                _error = null;
              }),
            ),
            const SizedBox(height: 16),
            OnboardingTextField(
              label: 'Business Bio',
              controller: _bioController,
              hint: 'What does your business do?',
              maxLines: 3,
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

