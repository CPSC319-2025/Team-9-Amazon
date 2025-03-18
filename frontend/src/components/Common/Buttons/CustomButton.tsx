interface CustomButtonProps {
  children: React.ReactNode;
  size?: 'small' | 'medium';
  onClick?: () => void;
  className?: string;
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
}

export default function CustomButton({
  children,
  onClick = () => {},
  className = '',
  variant = 'filled',
  disabled = false
}: CustomButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors py-2 px-4 min-w-[150px]';
  const variantStyles = variant === 'filled'
    ? 'bg-[#FF9900] text-white hover:bg-[#FF9900]/90'
    : 'border-2 border-[#FF9900] text-[#FF9900] hover:bg-[#FF9900]/10';

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
