import { Box, Typography } from '@mui/material';
import { FileText } from 'lucide-react';
import { colors, headerStyle, titleStyle, subtitleStyle } from '../../styles/commonStyles';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Header = ({ 
  title, 
  subtitle, 
  icon = <FileText size={32} style={{ color: colors.black1 }} />,
  actions 
}: HeaderProps) => {
  return (
    <Box sx={headerStyle}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: subtitle ? 800 : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={titleStyle}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" sx={subtitleStyle}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {actions}
      </Box>
    </Box>
  );
};