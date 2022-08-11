import NavTab from './navTab';
import Button from './button';
import Alert from './alert';
import Checkbox from './checkbox';
import Dialog from './dialog';
import GetCode from './getCode';
import IconButton from './iconButton';
import InputFind from './input_find';
import InputLine from './input_line';
import IntoGuide from './into_guide';
import IntoTab from './into_tab';
import Loading from './loading';
import NavMenu from './navMenu';
import OldUpload from './oldUploadFile';
import OtcPayIcon from './otcPayIcon';
import OtcReminder from './otcReminder';
import PageBanner from './pageBanner';
import Pagination from './pagination';
import Redio from './redio';
import ScrollPanel from './scrollPanel';
import Select from './select';
import Swiper from './swiper';
import Switch from './switch';
import Table from './table';
import TextAreaLine from './textArea_line';
import Tip from './tip';
import VerificationAlert from './verificationAlert';
import Calendar from './calendar';
import Verify from './verify';
import NoticeDialog from './noticeDialog';
import homeDialog from './homeDialog';
import Header from './header';
import Footer from './footer';
import QRcode from './QRcode';

const componentPlugins = {
  NavTab,
  Button,
  Alert,
  Checkbox,
  Dialog,
  GetCode,
  IconButton,
  InputFind,
  InputLine,
  IntoGuide,
  IntoTab,
  Loading,
  NavMenu,
  OldUpload,
  OtcPayIcon,
  OtcReminder,
  PageBanner,
  Pagination,
  Redio,
  ScrollPanel,
  Select,
  Swiper,
  Switch,
  Table,
  TextAreaLine,
  Tip,
  VerificationAlert,
  Calendar,
  Verify,
  NoticeDialog,
  homeDialog,
  Header,
  Footer,
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
