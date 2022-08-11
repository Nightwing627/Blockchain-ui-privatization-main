import Alert from './alert';
import Button from './button';
import Calendar from './calendar';
import CheckBox from './checkbox';
import Dialog from './dialog';
import GetCode from './getCode';
import H5Select from './h5_select';
import H5VerificationAlert from './verificationAlert';
import IconButton from './iconButton';
import InputLine from './input_line';
import InputFind from './input_find';
import IntoGuide from './into_guide';
import IntoTab from './into_tab';
import Loading from './loading';
import MBottomNav from './bottom_nav';
import MDataList from './dataList';
import MDropDownRefresh from './dropDownRefresh';
import MPullUpReload from './pullUpReload';
import MenusNav from './menusNav';
import NavSelect from './navSelect';
import NavTab from './navTab';
import OldUploadFile from './oldUploadFile';
import OtcPayIcon from './otcPayIcon';
import OtcReminder from './otcReminder';
import PageBanner from './pageBanner';
import Redio from './redio';
import Select from './select';
import Switch from './switch';
import TextAreaLine from './textArea_line';
import TableDetails from './tableDetails';
import Tip from './tip';
import Verify from './verify';
import NoticeDialog from './noticeDialog';
import Header from './header';
import QRcode from './QRcode';

const componentPlugins = {
  Alert,
  Button,
  Calendar,
  CheckBox,
  Dialog,
  GetCode,
  H5Select,
  H5VerificationAlert,
  IconButton,
  InputFind,
  InputLine,
  IntoGuide,
  IntoTab,
  Loading,
  MBottomNav,
  MDataList,
  MDropDownRefresh,
  MPullUpReload,
  MenusNav,
  NavSelect,
  NavTab,
  OldUploadFile,
  OtcPayIcon,
  OtcReminder,
  PageBanner,
  Redio,
  Select,
  Switch,
  TableDetails,
  TextAreaLine,
  Tip,
  Verify,
  NoticeDialog,
  Header,
  QRcode,
};
const registerPlugins = (Vue, plugins = {}) => {
  const pluginKeys = Object.keys(plugins);
  pluginKeys.forEach((item) => {
    if (item && plugins[item]) {
      Vue.use(plugins[item]);
    }
  });
};
const install = (Vue) => {
  if (install.installed) {
    return;
  }
  install.installed = true;
  registerPlugins(Vue, componentPlugins);
};

install.installed = false;

const BlockChainUI = {
  install,
};

export default BlockChainUI;
