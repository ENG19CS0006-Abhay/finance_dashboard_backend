const supabase = require("../config/supabase");

const getAssets = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const { data, error } = await supabase
      .from("assets")
      .select(`
        id,
        value,
        created_at,
        goodId,
        finance_goods (
          id,
          good_name
        )
      `)
      .eq("userId", userId)
      .order("id", { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createAsset = async (req, res) => {
  try {
    const { userId, goodId, value } = req.body;

    if (!userId || !goodId || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, goodId and value are required",
      });
    }

    const { data: existingAsset } = await supabase
      .from("assets")
      .select("*")
      .eq("userId", userId)
      .eq("goodId", goodId)
      .maybeSingle();

    if (existingAsset) {
      const { data, error } = await supabase
        .from("assets")
        .update({
          value,
        })
        .eq("id", existingAsset.id)
        .select();

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Asset updated successfully",
        data,
      });
    }

    const { data, error } = await supabase
      .from("assets")
      .insert([
        {
          userId,
          goodId,
          value,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { assetId, userId, value } = req.body;

    if (!assetId || !userId || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "assetId, userId and value are required",
      });
    }

    const { data, error } = await supabase
      .from("assets")
      .update({
        value,
      })
      .eq("id", assetId)
      .eq("userId", userId)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { assetId, userId } = req.body;

    if (!assetId || !userId) {
      return res.status(400).json({
        success: false,
        message: "assetId and userId are required",
      });
    }

    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", assetId)
      .eq("userId", userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveAllAssets = async (req, res) => {
  try {
    const { userId, assets } = req.body;

    if (!userId || !Array.isArray(assets)) {
      return res.status(400).json({
        success: false,
        message: "userId and assets array are required",
      });
    }

    const { data: existingAssets, error: fetchError } =
      await supabase
        .from("assets")
        .select("*")
        .eq("userId", userId);

    if (fetchError) {
      return res.status(500).json({
        success: false,
        message: fetchError.message,
      });
    }

    const existingMap = new Map();

    existingAssets.forEach((asset) => {
      existingMap.set(asset.goodId, asset);
    });

    const incomingGoodIds = assets.map(
      (asset) => asset.goodId
    );

    const updates = [];
    const inserts = [];

    for (const asset of assets) {
      const { goodId, value } = asset;

      if (!goodId || value === undefined) {
        continue;
      }

      const existingAsset =
        existingMap.get(goodId);

      if (existingAsset) {
        updates.push({
          id: existingAsset.id,
          value,
        });
      } else {
        inserts.push({
          userId,
          goodId,
          value,
        });
      }
    }

    if (updates.length) {
      for (const update of updates) {
        const { error } = await supabase
          .from("assets")
          .update({
            value: update.value,
          })
          .eq("id", update.id);

        if (error) {
          return res.status(500).json({
            success: false,
            message: error.message,
          });
        }
      }
    }

    if (inserts.length) {
      const { error } = await supabase
        .from("assets")
        .insert(inserts);

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }

    const idsToKeep = existingAssets
      .filter((asset) =>
        incomingGoodIds.includes(asset.goodId)
      )
      .map((asset) => asset.id);

    const idsToDelete = existingAssets
      .filter(
        (asset) =>
          !incomingGoodIds.includes(asset.goodId)
      )
      .map((asset) => asset.id);

    if (idsToDelete.length) {
      const { error } = await supabase
        .from("assets")
        .delete()
        .in("id", idsToDelete);

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }

    const { data, error } = await supabase
      .from("assets")
      .select(`
        id,
        value,
        created_at,
        goodId,
        finance_goods (
          id,
          good_name
        )
      `)
      .eq("userId", userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assets saved successfully",
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTotalAssetValue = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const { data, error } = await supabase
      .from("assets")
      .select("value")
      .eq("userId", userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const totalValue = data.reduce(
      (sum, asset) => sum + asset.value,
      0
    );

    return res.status(200).json({
      success: true,
      totalValue,
      totalAssets: data.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getTotalAssetValue,
  saveAllAssets
};
