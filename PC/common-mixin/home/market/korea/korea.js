export default {
  methods: {
    setCion(data, type) {
      if (type === 'b') {
        return `/ ${data.split('/')[1]}`;
      }

      return data.split('/')[0];
    },
    setTableData(data) {
      const arr = [];
      data.forEach((item) => {
        item.data.forEach((subItem) => {
          if (arr.length < 5) {
            arr.push(subItem);
          }
        });
        return false;
      });
      return arr;
    },
  },
};
