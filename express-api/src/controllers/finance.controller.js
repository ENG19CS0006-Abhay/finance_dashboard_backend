const supabase = require("../config/supabase");

const getFinanceGoods = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("finance_goods")
      .select("*")
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

module.exports = {
  getFinanceGoods,
};
