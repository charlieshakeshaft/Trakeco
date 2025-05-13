class User {
  final int id;
  final String username;
  final String email;
  final String? name;
  final int? companyId;
  final int pointsTotal;
  final int streakCount;
  final String role;
  final String? createdAt;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.name,
    this.companyId,
    required this.pointsTotal,
    required this.streakCount,
    required this.role,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      name: json['name'],
      companyId: json['company_id'],
      pointsTotal: json['points_total'] ?? 0,
      streakCount: json['streak_count'] ?? 0,
      role: json['role'] ?? 'user',
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'name': name,
      'company_id': companyId,
      'points_total': pointsTotal,
      'streak_count': streakCount,
      'role': role,
      'created_at': createdAt,
    };
  }

  String get displayName => name ?? username;
  
  bool get isAdmin => role == 'admin';
}