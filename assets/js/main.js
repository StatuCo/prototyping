const router = new VueRouter({
  mode: 'history',
  base: '/prototyping/',
  routes: [
    {
      path: "/:project"
    },
  ]
});

const app = new Vue({
  router,
  data() {
    return {
      project: "",
      load: {
        barCount: 4.0,
        bar: false,
        show: false
      },
      hotspot: {
        activeItem: false,
        activeTimer: null
      },
      window: { x: 0, y: 0 },
      image: { original: 0, changed: 0 },
      config: {
        activePage: 1,
        zoom: 1
      }
    }
  },
  methods: {
    getWindowAxes($window, that, next) {
      that.window.x = $window.innerWidth();
      that.window.y = $window.innerHeight();

      $window.resize(() => {
        that.window.x = $window.innerWidth();
        that.window.y = $window.innerHeight();
      });

      next();
    },
    getImageAxes() {
      let $image = $("img.prototype__screen-image");
      this.image = {
        original: $image.prop("naturalWidth"),
        changed: $image.prop("naturalWidth")
      }

      let $window = $(window);
      ($window.innerWidth() <= this.image.original)
        ? this.image.changed = $window.innerWidth()
        : this.image.changed = $image.prop("naturalWidth");

      $window.resize(() => {
        if ($window.innerWidth() <= this.image.original) {
          this.image.changed = $window.innerWidth()
        } else {
          this.image.changed = $image.prop("naturalWidth")
        }
      });
    },
    getHotspotItems() {
      this.hotspot.activeItem = true;
      clearInterval(this.hotspot.activeTimer);
      this.hotspot.activeTimer = setInterval(() => {
        this.hotspot.activeItem = false;
      }, 300)
    },
    getPrototypeAction($item) {
      if (!$item) return false;
      this.config.activePage = $item.page;
    },
    getStylePercent($number) {
      return (($number/100)*this.getItemPercent).toFixed(0);
    }
  },
  computed: {
    getHotspotWidth() {
      return this.image.changed > 0 ? this.image.changed +'px' : null;
    },
    getActivePageImageUrl() {
      return `projects/${this.project}/${this.config.activePage}.png`
    },
    getItemPercent() {
      return ((100 * this.image.changed)/this.image.original).toFixed(2);
    },
    getPrototypeList() {
      let pagePrototypeList = this.config.prototype["page"+this.config.activePage] || [];
      if (this.config.prototype["global"]) {
        this.config.prototype["global"].forEach(function(e) {
          if (pagePrototypeList.indexOf(e) === -1) pagePrototypeList.push(e);
        })
      }
      return pagePrototypeList;
    }
  },
  beforeCreate() {
    setInterval(() => {
      if (!this.load.bar) (this.load.barCount < 40) ? this.load.barCount += 1 : this.load.barCount += .1;
    }, 100);
  },
  created() {
    let that = this;
    if (this.$route.params.project) {
      // Set project Path/Name
      this.project = this.$route.params.project;

      // Get projects config file
      axios.get('projects/'+that.project+'/project.json').then(r => {
        if (typeof r.data !== "object") window.location.href = "https://statu.co";
        this.config = Object.assign(this.config, r.data);
      }).then(() => {
        document.title = this.config.name + " - Statu";
        $('meta[name="description"]').attr("content", this.config.description);
        this.config.activePage = 1;
      }).then(() => {
        that.getWindowAxes($(window), that, function() {
          that.getImageAxes($("img.prototype__screen-image"), that);
          setTimeout(() => {that.load.bar = true}, 500)
          setTimeout(() => {that.load.show = true}, 2000)
        });
      });
    } else {
      window.location.href = "https://statu.co";
    }
  },
}).$mount('#app');

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('sw.js').then(() => console.log("[SW] Is activated."));
// }
