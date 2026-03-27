import { defineComponent, h } from "vue";

/** NuxtLink mock — renders as an <a> tag */
export const NuxtLink = defineComponent({
  name: "NuxtLink",
  props: {
    to: { type: [String, Object], default: "#" },
    custom: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => {
      if (props.custom && slots.default) {
        return slots.default({ navigate: () => {}, href: "#" });
      }
      return h(
        "a",
        { href: typeof props.to === "string" ? props.to : "#" },
        slots.default?.(),
      );
    };
  },
});

/** UIcon mock — renders icon name as text inside a <span> */
export const UIcon = defineComponent({
  name: "UIcon",
  props: {
    name: { type: String, default: "" },
    size: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "span",
        { class: ["icon-mock", attrs.class].filter(Boolean).join(" "), "aria-hidden": attrs["aria-hidden"] },
        props.name,
      );
  },
});

/** UBadge mock — renders slot content inside a styled <span> */
export const UBadge = defineComponent({
  name: "UBadge",
  props: {
    color: { type: String, default: "neutral" },
    variant: { type: String, default: "solid" },
    size: { type: String, default: "md" },
  },
  setup(props, { slots }) {
    return () =>
      h(
        "span",
        {
          class: `badge-mock badge-${props.variant} badge-${props.color}`,
          style: {
            display: "inline-flex",
            alignItems: "center",
            padding: "0.125rem 0.5rem",
            fontSize: "0.75rem",
            borderRadius: "9999px",
            border: "1px solid currentColor",
          },
        },
        slots.default?.(),
      );
  },
});

/** UButton mock */
export const UButton = defineComponent({
  name: "UButton",
  props: {
    label: { type: String, default: undefined },
    icon: { type: String, default: undefined },
    color: { type: String, default: "primary" },
    variant: { type: String, default: "solid" },
    size: { type: String, default: "md" },
    to: { type: [String, Object], default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h(
        props.to ? "a" : "button",
        {
          class: `btn-mock btn-${props.variant} btn-${props.color}`,
          href: typeof props.to === "string" ? props.to : undefined,
        },
        slots.default?.() ?? props.label,
      );
  },
});

/** UPopover mock */
export const UPopover = defineComponent({
  name: "UPopover",
  setup(_props, { slots }) {
    return () => h("div", { class: "popover-mock" }, slots.default?.());
  },
});
