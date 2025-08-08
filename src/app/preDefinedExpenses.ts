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

export const BANK_TRANSFERS = {
  AXIS_TO_SBI: (amount: string) => {
    return [
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Transfered amount ${amount} from Axis to SBI`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "debit",
        bank: "Axis",
      },
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Received amount ${amount} from Axis`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "credit",
        bank: "SBI",
      },
    ];
  },
  AXIS_TO_DCB: (amount: string) => {
    return [
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Transfered amount ${amount} from Axis to DCB`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "debit",
        bank: "Axis",
      },
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Received amount ${amount} from Axis`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "credit",
        bank: "DCB",
      },
    ];
  },
  SBI_TO_AXIS: (amount: string) => {
    return [
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Transfered amount ${amount} from SBI to Axis`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "debit",
        bank: "SBI",
      },
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Received amount ${amount} from SBI`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "credit",
        bank: "Axis",
      },
    ];
  },
  SBI_TO_DCB: (amount: string) => {
    return [
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Transfered amount ${amount} from SBI to DCB`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "debit",
        bank: "SBI",
      },
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Received amount ${amount} from SBI`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "credit",
        bank: "DCB",
      },
    ];
  },
  DCB_TO_AXIS: (amount: string) => {
    return [
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Transfered amount ${amount} from DCB to Axis`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "debit",
        bank: "DCB",
      },
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Received amount ${amount} from DCB`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "credit",
        bank: "Axis",
      },
    ];
  },
  DCB_TO_SBI: (amount: string) => {
    return [
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Transfered amount ${amount} from DCB to SBI`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "debit",
        bank: "DCB",
      },
      {
        amount: amount,
        category: "Bank Transfer",
        description: `Received amount ${amount} from DCB`,
        date: "",
        time: "",
        payment_mode: "UPI",
        payment_type: "credit",
        bank: "SBI",
      },
    ];
  },
};
