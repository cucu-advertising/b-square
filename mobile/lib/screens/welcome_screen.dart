import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import 'package:provider/provider.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../providers/signup_flow_provider.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_background.dart';
import '../widgets/brand_header.dart';
import '../widgets/more_options_sheet.dart';
import '../widgets/pill_button.dart';
import 'home_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final _authService = AuthService();
  bool _signingIn = false;

  static const _callbackScheme = 'com.cucuadvertising.bsquare';

  bool get _showAppleSignIn => !kIsWeb && Platform.isIOS;

  Future<void> _signInWithLinkedIn() async {
    if (_signingIn) return;
    setState(() => _signingIn = true);
    try {
      final authUrl = await _authService.linkedInAuthorizeUrl();
      final result = await FlutterWebAuth2.authenticate(
        url: authUrl,
        callbackUrlScheme: _callbackScheme,
      );
      final uri = Uri.parse(result);
      final error = uri.queryParameters['error'];
      if (error != null && error.isNotEmpty) {
        throw AuthException('LinkedIn sign-in was cancelled or denied');
      }
      final code = uri.queryParameters['code'];
      if (code == null || code.isEmpty) {
        throw AuthException('LinkedIn sign-in failed: no code returned');
      }
      final user = await _authService.linkedInSignIn(code);
      if (!mounted) return;
      context.read<SignupFlowProvider>().applyUser(user);
      await Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute<void>(builder: (_) => const HomeScreen()),
        (_) => false,
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('LinkedIn sign-in failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _signingIn = false);
    }
  }

  Future<void> _signInWithApple() async {
    if (_signingIn) return;
    setState(() => _signingIn = true);
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      final identityToken = credential.identityToken;
      if (identityToken == null || identityToken.isEmpty) {
        throw AuthException('Apple sign-in failed: no token returned');
      }
      // Apple only ever gives the name on this very first authorization —
      // capture it now, it won't be available on later sign-ins.
      final nameParts = [
        credential.givenName,
        credential.familyName,
      ].whereType<String>().where((s) => s.isNotEmpty);
      final fullName = nameParts.isEmpty ? null : nameParts.join(' ');

      final user = await _authService.appleSignIn(
        identityToken,
        fullName: fullName,
      );
      if (!mounted) return;
      context.read<SignupFlowProvider>().applyUser(user);
      await Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute<void>(builder: (_) => const HomeScreen()),
        (_) => false,
      );
    } on SignInWithAppleAuthorizationException catch (e) {
      if (!mounted) return;
      if (e.code == AuthorizationErrorCode.canceled) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Apple sign-in failed: ${e.message}')),
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Apple sign-in failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _signingIn = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: AppTheme.darkStatusBar,
      child: Scaffold(
        backgroundColor: AppColors.primary,
        body: Stack(
          fit: StackFit.expand,
          children: [
            const AuthBackground(),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    const Spacer(flex: 2),
                    const BrandHeader(),
                    const Spacer(flex: 3),
                    PillButton(
                      label: _signingIn
                          ? 'Signing in...'
                          : 'Sign in with LinkedIn',
                      leading: const _LinkedInIcon(),
                      onPressed: _signInWithLinkedIn,
                    ),
                    if (_showAppleSignIn) ...[
                      const SizedBox(height: 12),
                      PillButton(
                        label: _signingIn
                            ? 'Signing in...'
                            : 'Sign in with Apple',
                        leading: const Icon(
                          Icons.apple,
                          color: Colors.white,
                          size: 22,
                        ),
                        onPressed: _signInWithApple,
                      ),
                    ],
                    const SizedBox(height: 12),
                    PillButton(
                      label: 'More options',
                      foregroundColor: AppColors.white,
                      glass: true,
                      onPressed: () => MoreOptionsSheet.show(context),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LinkedInIcon extends StatelessWidget {
  const _LinkedInIcon();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFF0A66C2),
        borderRadius: BorderRadius.circular(4),
      ),
      child: const Text(
        'in',
        style: TextStyle(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w700,
          height: 1,
        ),
      ),
    );
  }
}
