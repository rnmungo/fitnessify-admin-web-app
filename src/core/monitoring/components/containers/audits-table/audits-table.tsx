import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import MuiAlert from '@mui/material/Alert';
import MuiBox from '@mui/material/Box';
import MuiButton from '@mui/material/Button';
import MuiChip from '@mui/material/Chip';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogActions from '@mui/material/DialogActions';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiFormControl from '@mui/material/FormControl';
import MuiFormHelperText from '@mui/material/FormHelperText';
import MuiIconButton from '@mui/material/IconButton';
import MuiInputLabel from '@mui/material/InputLabel';
import MuiMenuItem from '@mui/material/MenuItem';
import MuiPaper from '@mui/material/Paper';
import MuiSelect from '@mui/material/Select';
import MuiSkeleton from '@mui/material/Skeleton';
import MuiStack from '@mui/material/Stack'
import MuiTable from '@mui/material/Table';
import MuiTableBody from '@mui/material/TableBody';
import MuiTableCell from '@mui/material/TableCell';
import MuiTableContainer from '@mui/material/TableContainer';
import MuiTableHead from '@mui/material/TableHead';
import MuiTablePagination from '@mui/material/TablePagination';
import MuiTableRow from '@mui/material/TableRow';
import MuiToolbar from '@mui/material/Toolbar';
import MuiTooltip from '@mui/material/Tooltip';
import MuiTypography from '@mui/material/Typography';
import MuiFilterListIcon from '@mui/icons-material/FilterList';
import MuiRefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/system';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { HTTP_METHODS_LIST } from '@/constants/http-methods';
import { useTranslation } from '@/core/i18n/context';
import { getDateLocale } from '@/core/i18n/utilities/localeUtils';
import Menu from '@/core/components/presentational/menu';
import { TableLoading, TablePaginationActions } from '@/core/components/presentational/table';
import { formatCompleteDate } from '@/utilities/dateUtils';
import { getColorByHttpMethod } from '@/utilities/httpUtils';
import { ACTIONS_LIST } from '../../../constants/audit-actions';
import useQuerySearchAudits from '../../../hooks/useQuerySearchAudits';
import useQueryTenants from '../../../hooks/useQueryTenants';

import type { Audit } from '@/types/audit';
import type { Tenant } from '@/types/tenant';
import type { ColumnDefinition } from '@/core/components/presentational/table/types';

const StyledJsonPre = styled('pre')(({ theme }) => ({
  borderRadius: 2,
  backgroundColor: theme.palette.background.paper,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowX: 'auto',
  maxHeight: 400,
  padding: theme.spacing(2),
}));

const columns: Array<ColumnDefinition<Audit>> = [
  {
    field: 'userId',
    headerName: 'audits-page.table-columns.user',
    defaultValue: '-',
    width: 300,
    render: (row, _, translate, locale): React.ReactNode => {
      const dateFnsLocale = getDateLocale(locale || '');
      const formattedDate = formatCompleteDate(new Date(row.createdAt), dateFnsLocale);
      return (
        <>
          <MuiTypography variant="body2" gutterBottom>{row.userId}</MuiTypography>
          <MuiTypography variant="body2" color="textSecondary" gutterBottom>{row.applicationId}</MuiTypography>
          <MuiTypography variant="body2" color="textSecondary">{formattedDate}</MuiTypography>
        </>
      );
    }
  },
  {
    field: 'resource',
    headerName: 'audits-page.table-columns.resource',
    width: 'auto',
    defaultValue: '-',
    render: (row): React.ReactNode => {
      const color = getColorByHttpMethod(row.method);

      return (
        <>
          <MuiTypography variant="body2" gutterBottom>{row.resource}</MuiTypography>
          <MuiStack direction="row" spacing={1}>
            <MuiChip
              key={row.method}
              label={row.method}
              size="small"
              variant="outlined"
              color={color}
            />
            <MuiChip
              key={row.action}
              label={row.action}
              size="small"
              variant="outlined"
              color="default"
            />
          </MuiStack>
        </>
      );
    },
  },
  {
    field: 'ip',
    headerName: 'audits-page.table-columns.origin',
    defaultValue: '-',
    width: 150,
    render: (row): React.ReactNode => {
      return (
        <>
          <MuiTypography variant="body2" gutterBottom>{row.ip}</MuiTypography>
          <MuiTypography variant="body2" color="textSecondary">{row.userAgent}</MuiTypography>
        </>
      );
    }
  },
];

const ROWS_LIMIT = 10;
const ROW_HEIGHT_LARGE = 47;

interface LogsTableProps {
  rowsPerPage?: number;
}

const BaseTable = ({ children }: { children: React.ReactNode; }) => {
  const { t } = useTranslation();

  return (
    <MuiTable
      sx={{ minWidth: 750 }}
      aria-labelledby={t('audits-page.table.name')}
      size="small"
    >
      <MuiTableHead>
        <MuiTableRow>
          {columns.map(column => (
            <MuiTableCell
              key={column.field}
              align={column.align}
              padding="normal"
              sx={{ width: column.width }}
            >
              {t(column.headerName)}
            </MuiTableCell>
          ))}
          <MuiTableCell align="center" padding="normal" sx={{ width: 'auto' }}>
            {t('common.table.actions')}
          </MuiTableCell>
        </MuiTableRow>
      </MuiTableHead>
      <MuiTableBody>
        {children}
      </MuiTableBody>
    </MuiTable>
  );
};

interface DraftFiltersProps {
  action: string;
  applicationId: string;
  from: Date | null;
  to: Date | null;
};

const defaultDraftFilters: DraftFiltersProps = {
  action: '',
  applicationId: '',
  from: new Date(),
  to: new Date(),
};

const LogsTable = ({ rowsPerPage = ROWS_LIMIT }: LogsTableProps) => {
  const [openFiltersState, setOpenFiltersState] = useState<boolean>(false);
  const [draftFiltersState, setDraftFiltersState] = useState<DraftFiltersProps>(defaultDraftFilters);
  const [openBodyDetailState, setOpenBodyDetailState] = useState<boolean>(false);
  const [selectedAuditState, setSelectedAuditState] = useState<Audit | null>(null);
  const { locale, t } = useTranslation();
  const { data, status, refetch, filtersState, setFiltersState } = useQuerySearchAudits({
    page: '1',
    pageSize: `${rowsPerPage}`,
    applicationId: defaultDraftFilters.applicationId,
    from: format(defaultDraftFilters.from as Date, 'yyyy/MM/dd HH:mm'),
    to: format(defaultDraftFilters.to as Date, 'yyyy/MM/dd HH:mm'),
  });
  const queryTenants = useQueryTenants();

  const dateLocale = getDateLocale(locale);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setFiltersState((prevState) => ({ ...prevState, page: `${newPage + 1}` }));
  }, [setFiltersState]);

  const handleOpenFilters = useCallback(() => {
    setOpenFiltersState(true);
  }, []);

  const handleCloseFilters = useCallback((_?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason && ['backdropClick', 'escapeKeyDown'].includes(reason)) {
      return;
    }

    setOpenFiltersState(false);
  }, []);

  const handleOpenBodyDetail = useCallback((row: Audit) => {
    setSelectedAuditState(row);
    setOpenBodyDetailState(true);
  }, []);

  const handleCloseBodyDetail = useCallback((_?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason && ['backdropClick', 'escapeKeyDown'].includes(reason)) {
      return;
    }

    setOpenBodyDetailState(false);
    setSelectedAuditState(null);
  }, []);

  const handleMouseDownTenants = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  const handleRefetchTenants = () => {
    queryTenants.refetch();
  };

  const audits = data?.results || [];
  const page = Number(filtersState?.page || 1) - 1;
  const emptyRows =
    page > 0 ? Math.max(0, rowsPerPage - audits.length) : 0;

  const renderTable = () => {
    if (status === 'pending') {
      return <TableLoading columns={columns} rowsPerPage={rowsPerPage} />;
    }

    if (status === 'error') {
      return (
        <BaseTable>
          <MuiTableRow
            style={{
              height: rowsPerPage * ROW_HEIGHT_LARGE,
            }}
          >
            <MuiTableCell colSpan={columns.length + 1} align="center">
              <MuiAlert severity="error" action={
                <MuiButton color="inherit" size="small" onClick={() => refetch()}>
                  {t('common.wordings.retry')}
                </MuiButton>
              }>
                {t('audits-page.table.error.message')}
              </MuiAlert>
            </MuiTableCell>
          </MuiTableRow>
        </BaseTable>
      );
    }

    if (status === 'success' && audits.length === 0) {
      return (
        <BaseTable>
          <MuiTableRow
            style={{
              height: rowsPerPage * ROW_HEIGHT_LARGE,
            }}
          >
            <MuiTableCell colSpan={columns.length + 1} align="center">
              <MuiTypography variant="h6">
                {t('audits-page.table.empty.message')}
              </MuiTypography>
            </MuiTableCell>
          </MuiTableRow>
        </BaseTable>
      );
    }

    return (
      <BaseTable>
        {audits &&
          audits
            .map((row: Audit) => {
              const menuItems = [];

              if (!!row.requestBody) {
                menuItems.push({
                  label: t('audits-page.table-actions.see-detail'),
                  onClick: () => handleOpenBodyDetail(row),
                });
              }

              return (
                <MuiTableRow
                  key={row.id}
                  hover
                  tabIndex={-1}
                >
                  {columns.map(column => {
                    const value = row[column.field] || column.defaultValue || '';

                    return (
                      <MuiTableCell
                        key={`${column.field}-${row[column.field]}`}
                        align={column.align || 'left'}
                        padding="normal"
                        sx={{ width: column.width, verticalAlign: 'top' }}
                      >
                        {column.render ? column.render(row, value) : value}
                      </MuiTableCell>
                    );
                  })}
                  <MuiTableCell align="center">
                    <Menu
                      aria-label={t('audits-page.table-actions.menu-title', row)}
                      color="primary"
                      size="small"
                      options={menuItems}
                    />
                  </MuiTableCell>
                </MuiTableRow>
              );
            })}
        {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
          <MuiTableRow
            key={index}
            style={{
              height: ROW_HEIGHT_LARGE,
            }}
          >
            <MuiTableCell
              colSpan={columns.length + 1}
            />
          </MuiTableRow>
        ))}
      </BaseTable>
    );
  };

  const renderPagination = () => {
    if (status === 'pending') {
      return (
        <MuiSkeleton
          variant="rectangular"
          sx={{ minWidth: 750 }}
          height={53}
        />
      );
    }

    return (
      <MuiTablePagination
        component="div"
        count={data?.total || 0}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
        page={page}
        onPageChange={handleChangePage}
        labelDisplayedRows={({ from, to, count }) => {
          const total = count !== -1 ? count : t('common.table.more-pages', { to });

          return t('common.table.pagination', { from, to, total });
        }}
        labelRowsPerPage={t('common.table.rows-per-page')}
        slotProps={{
          actions: {
            previousButton: {
              'aria-label': t('common.table.previous-page'),
              title: t('common.table.previous-page')
            },
            nextButton: {
              'aria-label': t('common.table.next-page'),
              title: t('common.table.next-page')
            }
          }
        }}
        ActionsComponent={TablePaginationActions}
      />
    );
  };

  const tenantItems = useMemo(() =>
    queryTenants.data && queryTenants.data.map((tenant: Tenant) => (
      <MuiMenuItem key={tenant.id} value={tenant.applicationId}>
        {tenant.applicationId}
      </MuiMenuItem>
    )
  ), [queryTenants.data]);

  return (
    <>
      <MuiBox sx={{ width: '100%' }}>
        <MuiPaper sx={{ width: '100%' }}>
          <MuiToolbar
            sx={{ justifyContent: 'space-between' }}
            style={{
              paddingRight: '16px',
              paddingLeft: '16px'
            }}
            variant="regular"
          >
            <MuiTypography
              component="p"
              variant="h6"
              sx={{ fontWeight: 'normal' }}
            >
              {t('audits-page.table.name')}
            </MuiTypography>
            <MuiTooltip title={t('audits-page.filters.title')} placement="top">
              <MuiIconButton
                aria-label={t('audits-page.filters.button')}
                onClick={handleOpenFilters}
                tabIndex={-1}
              >
                <MuiFilterListIcon />
              </MuiIconButton>
            </MuiTooltip>
          </MuiToolbar>
          <MuiTableContainer>
            {renderTable()}
          </MuiTableContainer>
          {renderPagination()}
        </MuiPaper>
      </MuiBox>
      <MuiDialog open={openFiltersState} onClose={handleCloseFilters}>
        <MuiDialogTitle>{t('audits-page.filters.title')}</MuiDialogTitle>
        <MuiDialogContent>
          <MuiStack spacing={2} sx={{ py: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
              <DatePicker
                label={t('audits-page.filters.from')}
                value={draftFiltersState.from}
                onChange={(newValue) => setDraftFiltersState((prevState) => ({ ...prevState, from: newValue }))}
              />
              <DatePicker
                label={t('audits-page.filters.to')}
                value={draftFiltersState.to}
                onChange={(newValue) => setDraftFiltersState((prevState) => ({ ...prevState, to: newValue }))}
              />
            </LocalizationProvider>
            <MuiFormControl fullWidth error={queryTenants.status === 'error'}>
              <MuiInputLabel>{t('logs-page.filters.tenant')}</MuiInputLabel>
              <MuiSelect
                labelId="applicationId"
                id="applicationId"
                value={draftFiltersState.applicationId}
                label={t('audits-page.filters.tenant')}
                disabled={queryTenants.status === 'pending'}
                onChange={(e) => setDraftFiltersState((prevState) => ({ ...prevState, applicationId: e.target.value }))}
              >
                <MuiMenuItem value="">
                  {queryTenants.status === 'pending' ? t('common.wordings.loading') : t('common.wordings.all')}
                </MuiMenuItem>
                {tenantItems}
              </MuiSelect>
              {queryTenants.status === 'error' && (
                <MuiFormHelperText>
                  {t('audits-page.filters.label-retry')}
                  <MuiIconButton
                    size="small"
                    aria-label={t('audits-page.filters.icon-retry')}
                    color="info"
                    tabIndex={-1}
                    sx={{ ml: 1 }}
                    onMouseDown={handleMouseDownTenants}
                    onClick={handleRefetchTenants}
                  >
                    <MuiRefreshIcon fontSize="small" />
                  </MuiIconButton>
                </MuiFormHelperText>
              )}
            </MuiFormControl>
            <MuiFormControl fullWidth>
              <MuiInputLabel>{t('audits-page.filters.action')}</MuiInputLabel>
              <MuiSelect
                labelId="action"
                id="action"
                value={draftFiltersState.action}
                label={t('audits-page.filters.action')}
                onChange={(e) => setDraftFiltersState((prevState) => ({ ...prevState, action: e.target.value }))}
              >
                <MuiMenuItem value="">{t('common.wordings.all')}</MuiMenuItem>
                {ACTIONS_LIST.map((action) => (
                  <MuiMenuItem key={action} value={action}>{action}</MuiMenuItem>
                ))}
              </MuiSelect>
            </MuiFormControl>
          </MuiStack>
        </MuiDialogContent>
        <MuiDialogActions>
          <MuiButton onClick={handleCloseFilters}>{t('common.wordings.cancel')}</MuiButton>
          <MuiButton
            variant="contained"
            onClick={() => {
              setFiltersState((prevState) => ({
                ...prevState,
                action: draftFiltersState.action,
                applicationId: draftFiltersState.applicationId,
                from: format(draftFiltersState.from as Date, 'yyyy/MM/dd HH:mm'),
                to: format(draftFiltersState.to as Date, 'yyyy/MM/dd HH:mm'),
              }));
              setOpenFiltersState(false);
            }}
          >
            {t('common.wordings.apply')}
          </MuiButton>
        </MuiDialogActions>
      </MuiDialog>
      <MuiDialog open={openBodyDetailState} onClose={handleCloseBodyDetail} maxWidth="md" fullWidth>
        <MuiDialogTitle>{t('audits-page.body-detail.title')}</MuiDialogTitle>
        <MuiDialogContent dividers>
          <StyledJsonPre>
            {selectedAuditState
              ? JSON.stringify(JSON.parse(selectedAuditState.requestBody), null, 2)
              : t('audits-page.body-detail.no-data')}
          </StyledJsonPre>
        </MuiDialogContent>
        <MuiDialogActions>
          <MuiButton onClick={handleCloseBodyDetail} variant="contained">
            {t('common.wordings.close')}
          </MuiButton>
        </MuiDialogActions>
      </MuiDialog>
    </>
  );
}

export default LogsTable;
