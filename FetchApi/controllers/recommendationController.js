import Recommendation from "../../Model/Recommendation.js";
import User from "../../Model/User.js";

const throwSystemError = (res, error) => {
  res.status(500).json({
    message: "Something went wrong!",
  });
};
function recommend(type, amount, duration) {
  return {
    plan: `${type} – $${amount.toLocaleString()} for ${
      duration === "lifetime" ? "life" : duration + " years"
    }`,
    reason: `Based on your age, risk tolerance, and family status, we recommend a ${type} plan.`,
  };
}
function getRecommendationHandler({ age, income, dependents, riskTolerance }) {
  if (age < 40) {
    if (riskTolerance === "high") return recommend("Term Life", 500_000, 20);
    if (riskTolerance === "medium") return recommend("Term Life", 300_000, 15);
    return recommend("Whole Life", 250_000, "lifetime");
  }

  if (age >= 40 && age <= 60) {
    if (dependents > 0) return recommend("Whole Life", 400_000, "lifetime");
    return recommend("Universal Life", 300_000, "lifetime");
  }

  return recommend("Final Expense", 100_000, "lifetime");
}

const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.findAll();

    res.status(200).json({
      data: recommendations,
    });
  } catch (error) {
    throwSystemError(res, error);
  }
};

const getRecommendation = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        message: "id is required",
      });
    }
    const recommendation = await Recommendation.findByPk(id);
    if (!recommendation) {
      return res.status(404).json({
        message: "Recommendation not found",
      });
    }

    res.status(200).json({
      data: recommendation,
    });
  } catch (error) {
    throwSystemError(res, error);
  }
};

const createRecommendation = async (req, res) => {
  try {
    const { age, income, risk, dependents } = req.body;

    if (!age || !parseInt(age) || !parseInt(age) < 0 || !parseInt(age) > 150) {
      return res.status(400).json({
        message: "age is required",
      });
    }
    if (!income || !parseInt(income) || !parseInt(income) < 0) {
      return res.status(400).json({
        message: "income is required",
      });
    }

    if (
      dependents?.toString().trim() === "" ||
      parseInt(dependents.toString()) < 0
    ) {
      return res.status(400).json({
        message: "Number of dependents is required",
      });
    }

    const riskList = ["low", "medium", "high"];

    const riskLowerCase = risk?.toLowerCase().trim();

    if (!risk && !riskList.includes(riskLowerCase)) {
      return res.status(400).json({
        message: "Risk Tolerance is required",
      });
    }
    const userId = req.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const payload = {
      age,
      income,
      risk: riskLowerCase,
      dependents,
      userId,
    };

    const recommendation = await Recommendation.create(payload);
    const personalizedRecommendation = getRecommendationHandler({
      age,
      income,
      dependents,
      riskTolerance: risk,
    });

    res.status(201).json({
      data: {
        ...recommendation.dataValues,
        message: personalizedRecommendation.plan,
      },
    });
  } catch (error) {
    throwSystemError(res, error);
  }
};

const updateRecommendation = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }
    const { age, income, risk, dependents } = req.body;
    if (!age || !parseInt(age) || !parseInt(age) < 0 || !parseInt(age) > 150) {
      return res.status(400).json({
        message: "age is required",
      });
    }
    if (!income || !parseInt(income) || !parseInt(income) < 0) {
      return res.status(400).json({
        message: "income is required",
      });
    }

    if (dependents?.toString().trim() === "" || parseInt(dependents) < 0) {
      return res.status(400).json({
        message: "Number of dependents is required",
      });
    }
    const riskList = ["low", "medium", "high"];

    const riskLowerCase = risk?.toLowerCase().trim();

    if (!risk && !riskList.includes(riskLowerCase)) {
      return res.status(400).json({
        message: "Risk Tolerance is required",
      });
    }

    const userId = req.userId;
    const [recommendation, user] = await Promise.all([
      Recommendation.findByPk(id),
      User.findByPk(userId),
    ]);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    if (!recommendation) {
      return res.status(400).json({
        message: "recommendation not found",
      });
    }

    const payload = {
      age,
      income,
      risk: riskLowerCase,
      dependents,
      userId,
    };

    recommendation.update(payload);
    await recommendation.save();
    await recommendation.reload();

    res.status(201).json({
      data: recommendation,
    });
  } catch (error) {
    throwSystemError(res, error);
  }
};

const deleteRecommendation = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        message: "id is required",
      });
    }
    const recommendation = await Recommendation.findByPk(id);
    if (!recommendation) {
      return res.status(404).json({
        message: "Recommendation not found",
      });
    }

    await recommendation.destroy();

    res.status(200).json({
      message: "Recommendation has been deleted successfully",
    });
  } catch (error) {
    throwSystemError(res, error);
  }
};

export {
  getRecommendation,
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
};
