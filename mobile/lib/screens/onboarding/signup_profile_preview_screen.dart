import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/signup_flow_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/pill_button.dart';
import '../home_screen.dart';

class SignupProfilePreviewScreen extends StatelessWidget {
  const SignupProfilePreviewScreen({super.key});

  String _value(String value, {String fallback = 'Not selected'}) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? fallback : trimmed;
  }

  String _listValue(List<String> values) {
    if (values.isEmpty) return 'Not selected';
    return values.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<SignupFlowProvider>().data;
    final companyName = data.companyName.trim().isNotEmpty
        ? data.companyName.trim()
        : data.businessName.trim();

    final previewItems = [
      _PreviewItem(
        icon: Icons.person_outline_rounded,
        label: 'Name',
        value: _value(data.fullName),
      ),
      _PreviewItem(
        icon: Icons.business_outlined,
        label: 'Company / Business name',
        value: _value(companyName),
      ),
      _PreviewItem(
        icon: Icons.category_outlined,
        label: 'Industry',
        value: _value(data.industry),
      ),
      _PreviewItem(
        icon: Icons.location_on_outlined,
        label: 'City',
        value: _value(data.city),
      ),
      _PreviewItem(
        icon: Icons.currency_rupee_rounded,
        label: 'Annual revenue range',
        value: _value(data.revenueRange),
      ),
      _PreviewItem(
        icon: Icons.groups_outlined,
        label: 'Company size',
        value: _value(data.companySize),
      ),
      _PreviewItem(
        icon: Icons.link_rounded,
        label: 'Interested to connect',
        value: _listValue(data.lookingFor),
      ),
      _PreviewItem(
        icon: Icons.interests_outlined,
        label: 'Business interests and details',
        value: _listValue(data.businessInterests),
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(
                      Icons.arrow_back_ios_new_rounded,
                      color: AppColors.white,
                      size: 20,
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 40,
                      minHeight: 40,
                    ),
                  ),
                  const SizedBox(height: 12),
                  RichText(
                    text: TextSpan(
                      style: AppTheme.manrope(
                        fontSize: 30,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.8,
                        height: 1.15,
                        color: AppColors.white,
                      ),
                      children: const [
                        TextSpan(
                          text: "Here's how some of what you share ",
                        ),
                        TextSpan(
                          text: 'will appear.',
                          style: TextStyle(color: AppColors.purple),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "We'll use this to show your profile to relevant people on BSquare.",
                    style: AppTheme.manrope(
                      fontSize: 16,
                      height: 1.45,
                      color: AppColors.mutedText,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: ListView.separated(
                      itemCount: previewItems.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final item = previewItems[index];
                        return _PreviewRow(item: item);
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      _PageDot(active: false),
                      SizedBox(width: 8),
                      _PageDot(active: true),
                    ],
                  ),
                  const SizedBox(height: 16),
                  PillButton(
                    label: 'Continue',
                    onPressed: () {
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute<void>(
                          builder: (_) => const HomeScreen(),
                        ),
                        (_) => false,
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PreviewItem {
  const _PreviewItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;
}

class _PreviewRow extends StatelessWidget {
  const _PreviewRow({required this.item});

  final _PreviewItem item;

  @override
  Widget build(BuildContext context) {
    final isPlaceholder = item.value == 'Not selected';

    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(item.icon, color: AppColors.mutedText, size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.label,
                  style: AppTheme.manrope(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.value,
                  style: AppTheme.manrope(
                    fontSize: 14,
                    height: 1.4,
                    fontWeight: FontWeight.w400,
                    color: isPlaceholder
                        ? AppColors.lightMuted
                        : AppColors.mutedText,
                    fontStyle:
                        isPlaceholder ? FontStyle.italic : FontStyle.normal,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PageDot extends StatelessWidget {
  const _PageDot({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: active ? 10 : 8,
      height: active ? 10 : 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: active ? AppColors.purple : AppColors.glassBorder,
      ),
    );
  }
}
