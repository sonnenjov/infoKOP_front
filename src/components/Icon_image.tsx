interface Props {
  icon: string
  active?: boolean
  activeSeason?: "summer" | "winter"
}

export default function Icon_image({ icon, active, activeSeason }: Props) {
  const activeFilter = activeSeason === "summer"
    ? "invert(60%) sepia(80%) saturate(500%) hue-rotate(40deg) brightness(90%)"
    : "invert(45%) sepia(90%) saturate(500%) hue-rotate(190deg) brightness(100%)"

  return (
    <img
      src={icon}
      alt="icon"
      style={{
        filter: active ? activeFilter : "invert(100%)", // invert(100%) = white
        width: "1.5em",
        height: "1.5em"
      }}
    />
  )
}