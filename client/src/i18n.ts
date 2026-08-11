export type Locale = "en" | "vi";

const en = {
  title: "Users",
  namePlaceholder: "Name",
  emailPlaceholder: "Email",
  add: "Add",
  noUsers: "No users yet.",
  loadError: "failed to load users",
  requestFailed: "request failed",
  componentDemo: "Component demo",
  primary: "Primary",
  secondary: "Secondary",
  disabled: "Disabled",
  typeSomething: "Type something",
  nothingHere: "Nothing here yet.",
};

export const STRINGS: Record<Locale, Record<keyof typeof en, string>> = {
  en,
  vi: {
    title: "Người dùng",
    namePlaceholder: "Tên",
    emailPlaceholder: "Email",
    add: "Thêm",
    noUsers: "Chưa có người dùng nào.",
    loadError: "không thể tải danh sách người dùng",
    requestFailed: "yêu cầu thất bại",
    componentDemo: "Demo thành phần",
    primary: "Chính",
    secondary: "Phụ",
    disabled: "Vô hiệu hoá",
    typeSomething: "Nhập gì đó",
    nothingHere: "Chưa có gì ở đây.",
  },
};
