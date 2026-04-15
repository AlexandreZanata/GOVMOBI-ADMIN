import { Permission } from "@/models";

/**
 * A single navigation item in the admin sidebar.
 */
export interface NavItemConfig {
  /** Route href for next/link. */
  href: string;
  /** i18n key inside the "nav" namespace. */
  labelKey: string;
  /** Lucide icon component name. */
  icon: string;
  /** When set, the item is hidden unless the user has this permission. */
  permission?: Permission;
}

/**
 * Ordered list of admin sidebar navigation items.
 * Items with a `permission` field are wrapped in a `<Can>` gate at render time.
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    href: "/runs",
    labelKey: "runs",
    icon: "ClipboardList",
    permission: Permission.VIEW_RUNS,
  },
  {
    href: "/cargos",
    labelKey: "cargos",
    icon: "Briefcase",
    permission: Permission.CARGO_VIEW,
  },
  {
    href: "/lotacoes",
    labelKey: "lotacoes",
    icon: "MapPin",
    permission: Permission.LOTACAO_VIEW,
  },
  {
    href: "/servidores",
    labelKey: "servidores",
    icon: "UserCheck",
    permission: Permission.SERVIDOR_VIEW,
  },
  {
    href: "/frota/motoristas",
    labelKey: "motoristas",
    icon: "Truck",
    permission: Permission.MOTORISTA_VIEW,
  },
  {
    href: "/frota/veiculos",
    labelKey: "veiculos",
    icon: "Car",
    permission: Permission.VEICULO_VIEW,
  },
  {
    href: "/users",
    labelKey: "users",
    icon: "Users",
    permission: Permission.USER_VIEW,
  },
  {
    href: "/departments",
    labelKey: "departments",
    icon: "Building2",
    permission: Permission.DEPARTMENT_VIEW,
  },
  {
    href: "/audit",
    labelKey: "audit",
    icon: "ScrollText",
    permission: Permission.AUDIT_VIEW,
  },
];
