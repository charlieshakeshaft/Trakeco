class Reward {
  final int id;
  final String title;
  final String description;
  final int costPoints;
  final int? quantityLimit;
  final int? companyId;
  final String createdAt;

  Reward({
    required this.id,
    required this.title,
    required this.description,
    required this.costPoints,
    this.quantityLimit,
    this.companyId,
    required this.createdAt,
  });

  factory Reward.fromJson(Map<String, dynamic> json) {
    return Reward(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      costPoints: json['cost_points'],
      quantityLimit: json['quantity_limit'],
      companyId: json['company_id'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'cost_points': costPoints,
      'quantity_limit': quantityLimit,
      'company_id': companyId,
      'created_at': createdAt,
    };
  }

  String get icon {
    if (title.toLowerCase().contains('coffee')) {
      return 'local_cafe';
    } else if (title.toLowerCase().contains('lunch')) {
      return 'restaurant';
    } else if (title.toLowerCase().contains('discount') || title.toLowerCase().contains('off')) {
      return 'local_offer';
    } else if (title.toLowerCase().contains('gift')) {
      return 'card_giftcard';
    } else {
      return 'redeem';
    }
  }
}

class Redemption {
  final int id;
  final int userId;
  final int rewardId;
  final String redeemedAt;

  Redemption({
    required this.id,
    required this.userId,
    required this.rewardId,
    required this.redeemedAt,
  });

  factory Redemption.fromJson(Map<String, dynamic> json) {
    return Redemption(
      id: json['id'],
      userId: json['user_id'],
      rewardId: json['reward_id'],
      redeemedAt: json['redeemed_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'reward_id': rewardId,
      'redeemed_at': redeemedAt,
    };
  }
}

class UserRedemption {
  final Reward reward;
  final Redemption redemption;

  UserRedemption({
    required this.reward,
    required this.redemption,
  });

  factory UserRedemption.fromJson(Map<String, dynamic> json) {
    return UserRedemption(
      reward: Reward.fromJson(json['reward']),
      redemption: Redemption.fromJson(json['redemption']),
    );
  }
}