interface MobileHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

const MobileHeader = ({ isMenuOpen, onMenuToggle }: MobileHeaderProps) => {
  return (
    <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-icons text-sm">eco</span>
          </div>
          <h1 className="text-xl font-semibold ml-2 text-gray-800">Trak</h1>
        </div>
        <button className="text-gray-500" onClick={onMenuToggle}>
          <span className="material-icons">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileHeader;
