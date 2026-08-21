import 'package:flutter/foundation.dart';

import '../models/signup_data.dart';

class SignupFlowProvider extends ChangeNotifier {
  SignupFlowProvider({SignupData? initialData}) : _data = initialData ?? SignupData();

  final SignupData _data;
  SignupData get data => _data;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  void update(VoidCallback mutate) {
    mutate();
    notifyListeners();
  }

  void applyUser(Map<String, dynamic> userJson) {
    _data.applyFromUserJson(userJson);
    notifyListeners();
  }

  void clear() {
    _data.applyFromUserJson(const {});
    _data.id = '';
    _data.password = '';
    _data.confirmPassword = '';
    _data.phone = '';
    _data.profilePhotoBytes = null;
    _data.profilePhotoPath = null;
    _data.companyLogoBytes = null;
    _data.companyLogoPath = null;
    _data.businessGalleryBytes = [];
    _data.businessGalleryPaths = [];
    _data.headline = "I'm a Member of BSquare";
    notifyListeners();
  }

  Future<T> runAsync<T>(Future<T> Function() action) async {
    _isLoading = true;
    notifyListeners();
    try {
      return await action();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
