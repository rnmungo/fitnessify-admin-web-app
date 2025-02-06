import { MouseEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import MuiBox from '@mui/material/Box';
import MuiIconButton from '@mui/material/IconButton';
import MuiFirstPageIcon from '@mui/icons-material/FirstPage';
import MuiKeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import MuiKeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import MuiLastPageIcon from '@mui/icons-material/LastPage';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

const TablePaginationActions = (props: TablePaginationActionsProps) => {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <MuiBox sx={{ flexShrink: 0, ml: 2.5 }}>
      <MuiIconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <MuiLastPageIcon /> : <MuiFirstPageIcon />}
      </MuiIconButton>
      <MuiIconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <MuiKeyboardArrowRight /> : <MuiKeyboardArrowLeft />}
      </MuiIconButton>
      <MuiIconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <MuiKeyboardArrowLeft /> : <MuiKeyboardArrowRight />}
      </MuiIconButton>
      <MuiIconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <MuiFirstPageIcon /> : <MuiLastPageIcon />}
      </MuiIconButton>
    </MuiBox>
  );
};

export default TablePaginationActions;
