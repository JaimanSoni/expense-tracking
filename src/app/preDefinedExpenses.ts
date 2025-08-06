const PRE_DEFINED_EXPENSES = {
  TRAVEL: {
    HOME_TO_OFFICE: (amount: string, date: string, time: string) => {
      return {
        amount: amount,
        category: "Travel",
        description: "Traveling expense from home to office.",
        date: date,
        time: time,
        payment_mode: "UPI",
        payment_type: "debit",
      };
    },
  },
};
