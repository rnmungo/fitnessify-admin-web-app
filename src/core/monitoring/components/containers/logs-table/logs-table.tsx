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
import { useTranslation } from '@/core/i18n/context';
import { getDateLocale } from '@/core/i18n/utilities/localeUtils';
import Menu from '@/core/components/presentational/menu';
import { TableLoading, TablePaginationActions } from '@/core/components/presentational/table';
import { formatCompleteDate } from '@/utilities/dateUtils';
import { APPLICATIONS, DEFAULT_APPLICATION } from '../../../constants/application';
import { getColorByLogLevel } from '../../../utilities/logUtils';
import useQuerySearchLogs from '../../../hooks/useQuerySearchLogs';
import useQueryTenants from '../../../hooks/useQueryTenants';

import type { Log } from '@/types/log';
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

const columns: Array<ColumnDefinition<Log>> = [
  {
    field: 'timeStamp',
    headerName: 'logs-page.table-columns.date',
    defaultValue: '-',
    width: 250,
    render: (row, _, translate, locale): React.ReactNode => {
      const dateFnsLocale = getDateLocale(locale || '');
      const formattedDate = formatCompleteDate(new Date(row.timeStamp), dateFnsLocale);
      const color = getColorByLogLevel(row.level);

      return (
        <>
          <MuiTypography variant="body2" gutterBottom>{formattedDate}</MuiTypography>
          <MuiChip
            key={row.level}
            label={row.level}
            size="small"
            variant="outlined"
            color={color}
          />
        </>
      );
    }
  },
  {
    field: 'tenantName',
    headerName: 'logs-page.table-columns.application',
    width: 200,
    defaultValue: '-',
    render: (row): React.ReactNode => (
      <>
        <MuiTypography variant="body2" gutterBottom>{row.tenantName}</MuiTypography>
        <MuiChip
          key={row.applicationId}
          label={row.applicationId}
          size="small"
          variant="outlined"
          color="default"
        />
      </>
    ),
  },
  { field: 'message', headerName: 'logs-page.table-columns.message', width: 'auto' },
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
      aria-labelledby={t('logs-page.table.name')}
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
  applicationId: string;
  from: Date | null;
  tenantName: string;
  to: Date | null;
};

const defaultDraftFilters: DraftFiltersProps = {
  applicationId: DEFAULT_APPLICATION,
  from: new Date(),
  tenantName: '',
  to: new Date(),
};

const LogsTable = ({ rowsPerPage = ROWS_LIMIT }: LogsTableProps) => {
  const [openFiltersState, setOpenFiltersState] = useState<boolean>(false);
  const [draftFiltersState, setDraftFiltersState] = useState<DraftFiltersProps>(defaultDraftFilters);
  const [openLogDetailState, setOpenLogDetailState] = useState<boolean>(false);
  const [selectedLogState, setSelectedLogState] = useState<Log | null>(null);
  const { locale, t } = useTranslation();
  const { data, status, refetch, filtersState, setFiltersState } = useQuerySearchLogs({
    page: '1',
    pageSize: `${rowsPerPage}`,
    applicationId: defaultDraftFilters.applicationId,
    tenantName: defaultDraftFilters.tenantName,
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

  const handleOpenLogDetail = useCallback((row: Log) => {
    setSelectedLogState(row);
    setOpenLogDetailState(true);
  }, []);

  const handleCloseLogDetail = useCallback((_?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason && ['backdropClick', 'escapeKeyDown'].includes(reason)) {
      return;
    }

    setOpenLogDetailState(false);
    setSelectedLogState(null);
  }, []);

  const handleMouseDownTenants = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  const handleRefetchTenants = () => {
    queryTenants.refetch();
  };

  const logs = data?.results || [];
  const page = Number(filtersState?.page || 1) - 1;
  const emptyRows =
    page > 0 ? Math.max(0, rowsPerPage - logs.length) : 0;

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
                {t('logs-page.table.error.message')}
              </MuiAlert>
            </MuiTableCell>
          </MuiTableRow>
        </BaseTable>
      );
    }

    if (status === 'success' && logs.length === 0) {
      return (
        <BaseTable>
          <MuiTableRow
            style={{
              height: rowsPerPage * ROW_HEIGHT_LARGE,
            }}
          >
            <MuiTableCell colSpan={columns.length + 1} align="center">
              <MuiTypography variant="h6">
                {t('logs-page.table.empty.message')}
              </MuiTypography>
            </MuiTableCell>
          </MuiTableRow>
        </BaseTable>
      );
    }

    return (
      <BaseTable>
        {logs &&
          logs
            .map((row: Log) => (
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
                    aria-label={t('logs-page.table-actions.menu-title', row)}
                    color="primary"
                    size="small"
                    options={[
                      {
                        label: t('logs-page.table-actions.see-detail'),
                        onClick: () => handleOpenLogDetail(row),
                      },
                    ]}
                  />
                </MuiTableCell>
              </MuiTableRow>
            ))}
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
              {t('logs-page.table.name')}
            </MuiTypography>
            <MuiTooltip title={t('logs-page.filters.title')} placement="top">
              <MuiIconButton
                aria-label={t('logs-page.filters.button')}
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
        <MuiDialogTitle>{t('logs-page.filters.title')}</MuiDialogTitle>
        <MuiDialogContent>
          <MuiStack spacing={2} sx={{ py: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
              <DatePicker
                label={t('logs-page.filters.from')}
                value={draftFiltersState.from}
                onChange={(newValue) => setDraftFiltersState((prevState) => ({ ...prevState, from: newValue }))}
              />
              <DatePicker
                label={t('logs-page.filters.to')}
                value={draftFiltersState.to}
                onChange={(newValue) => setDraftFiltersState((prevState) => ({ ...prevState, to: newValue }))}
              />
            </LocalizationProvider>
            <MuiFormControl fullWidth error={queryTenants.status === 'error'}>
              <MuiInputLabel>{t('logs-page.filters.tenant')}</MuiInputLabel>
              <MuiSelect
                labelId="tenantName"
                id="tenantName"
                value={draftFiltersState.tenantName}
                label={t('logs-page.filters.tenant')}
                disabled={queryTenants.status === 'pending'}
                onChange={(e) => setDraftFiltersState((prevState) => ({ ...prevState, tenantName: e.target.value }))}
              >
                <MuiMenuItem value="">
                  {queryTenants.status === 'pending' ? t('common.wordings.loading') : t('common.wordings.all')}
                </MuiMenuItem>
                {tenantItems}
              </MuiSelect>
              {queryTenants.status === 'error' && (
                <MuiFormHelperText>
                  {t('logs-page.filters.label-retry')}
                  <MuiIconButton
                    size="small"
                    aria-label={t('logs-page.filters.icon-retry')}
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
              <MuiInputLabel>{t('logs-page.filters.application')}</MuiInputLabel>
              <MuiSelect
                value={draftFiltersState.applicationId}
                label={t('logs-page.filters.application')}
                onChange={(e) => setDraftFiltersState((prevState) => ({ ...prevState, applicationId: e.target.value }))}
              >
                <MuiMenuItem value="">{t('common.wordings.all')}</MuiMenuItem>
                {APPLICATIONS.map((application) => (
                  <MuiMenuItem key={application} value={application}>{application}</MuiMenuItem>
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
                applicationId: draftFiltersState.applicationId,
                from: format(draftFiltersState.from as Date, 'yyyy/MM/dd HH:mm'),
                tenantName: draftFiltersState.tenantName,
                to: format(draftFiltersState.to as Date, 'yyyy/MM/dd HH:mm'),
              }));
              setOpenFiltersState(false);
            }}
          >
            {t('common.wordings.apply')}
          </MuiButton>
        </MuiDialogActions>
      </MuiDialog>
      <MuiDialog open={openLogDetailState} onClose={handleCloseLogDetail} maxWidth="md" fullWidth>
        <MuiDialogTitle>{t('logs-page.log-detail.title')}</MuiDialogTitle>
        <MuiDialogContent dividers>
          <StyledJsonPre>
            {selectedLogState
              ? JSON.stringify(JSON.parse(selectedLogState.logEvent), null, 2)
              : t('logs-page.log-detail.no-data')}
          </StyledJsonPre>
        </MuiDialogContent>
        <MuiDialogActions>
          <MuiButton onClick={handleCloseLogDetail} variant="contained">
            {t('common.wordings.close')}
          </MuiButton>
        </MuiDialogActions>
      </MuiDialog>
    </>
  );
}

export default LogsTable;
