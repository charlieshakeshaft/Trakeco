interface IconBadgeProps {
  icon: string;
  color?: string;
  bgColor?: string;
}

const IconBadge = ({ icon, color = "primary", bgColor = "primary/10" }: IconBadgeProps) => {
  return (
    <div className={`p-2 rounded-lg bg-${bgColor} text-${color}`}>
      <span className="material-icons">{icon}</span>
    </div>
  );
};

export default IconBadge;
