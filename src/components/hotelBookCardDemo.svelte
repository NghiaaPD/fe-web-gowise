<!-- Demo usage of HotelBookCard component -->
<script lang="ts">
  import HotelBookCard from "./hotelBookCard.svelte";

  const sampleHotelData = {
    name: "OGIKUBO TOMBO HOTEL",
    type: "hotel",
    price: "$40",
    price_value: 40.0,
    currency: "USD",
    rating: 5,
    rating_count: 4,
    distance: "",
    neighborhood: "Suginami by Wyndham Bali",
    address: "Hot Spa",
    score: 0.016,
    main_image: {
      thumbnail:
        "https://lh4.googleusercontent.com/proxy/AP7sHd0IZlRJndsltErSfhBjJ1dzXvrMcj6WlklE4dVL9VZcH8WpFF0RmcekpYHlqrHl5NDauzVUN-MO6x_TR6fzUrrlCDtJ0-bKNtHXkOOsqu2NIo2MROWRCV1qSZxQyGC77zRydx_n-cUbhcL-ysk2zlbslKk=s287-w287-h192-n-k-no-v1",
      original_image:
        "https://images.trvl-media.com/lodging/120000000/119090000/119080900/119080886/b9fc72dc_z.jpg",
    },
    images: [
      {
        thumbnail:
          "https://lh4.googleusercontent.com/proxy/AP7sHd0IZlRJndsltErSfhBjJ1dzXvrMcj6WlklE4dVL9VZcH8WpFF0RmcekpYHlqrHl5NDauzVUN-MO6x_TR6fzUrrlCDtJ0-bKNtHXkOOsqu2NIo2MROWRCV1qSZxQyGC77zRydx_n-cUbhcL-ysk2zlbslKk=s287-w287-h192-n-k-no-v1",
        original_image:
          "https://images.trvl-media.com/lodging/120000000/119090000/119080900/119080886/b9fc72dc_z.jpg",
      },
      {
        thumbnail:
          "https://lh5.googleusercontent.com/proxy/ax2qxRra5T6R_mjPWJckiieZQl7_nD2Siv0muY4yHHdAypwYud-RrB6CNaGOPkfYA7XbWrjRysVtf1C35SLh0Kwzmif9nfFmkfSPp0m9_WjDPtKCJlFxzO34JSFhjmHFXO8-s_YOwlbGNqM35Ymd2VX_4jOOi2Y=s287-w287-h192-n-k-no-v1",
        original_image:
          "https://images.trvl-media.com/lodging/120000000/119090000/119080900/119080886/c742bd14_z.jpg",
      },
      {
        thumbnail:
          "https://lh4.googleusercontent.com/proxy/CyM_0ooDEUZF7yO4tE_XLwqnQPWze5JCuMzMeDaTsMHZZ2hdg4zVvWdoVrFdWEJq2-zkX96vPtxCV5VV075xiiOSdqBOOrLkB3nKMouEZ86jJWCKw23QW5E9r4vyEuejqK-l4FpsIhqyL3rFFuaFyrWbEcFSzXc=s287-w287-h192-n-k-no-v1",
        original_image:
          "https://images.trvl-media.com/lodging/120000000/119090000/119080900/119080886/5a2b7e69_z.jpg",
      },
      {
        thumbnail:
          "https://lh3.googleusercontent.com/p/AF1QipNNjVw_Ti2on2Manc4qSymZjL6-YK8yMOZrq2VU=s287-w287-h192-n-k-no-v1",
        original_image:
          "https://lh5.googleusercontent.com/p/AF1QipNNjVw_Ti2on2Manc4qSymZjL6-YK8yMOZrq2VU=s10000",
      },
      {
        thumbnail:
          "https://lh3.googleusercontent.com/p/AF1QipMQ-Fc4mInXb3o2diYp9CPDAG1extOCYUA0ak2Z=s287-w287-h192-n-k-no-v1",
        original_image:
          "https://lh5.googleusercontent.com/p/AF1QipMQ-Fc4mInXb3o2diYp9CPDAG1extOCYUA0ak2Z=s10000",
      },
    ],
    amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym"],
    hotel_class: "4-star hotel",
    description: "A beautiful hotel with modern amenities",
    link: "https://www.booking.com/hotel/jp/ogikubo-tombo.ja.html?aid=356980&label=gog235jc-10CAUodUIPb2dpa3Viby1zdGF0aW9uSBVYAWh1iAECmAEzuAEHyAEN2AED6AEB-AEBiAIBqAIBuAKZm6HFBsACAdICJGNiNmQ1Yjc2LTcyMDQtNDAwZC1iYTI0LWM0OTczMGNjMDJjY9gCAeACAQ&sid=760fe9c3d7f69d9c962933e51ab781cc&all_sr_blocks=1464145601_419410702_1_0_0&checkin=2025-08-22&checkout=2025-08-23&dest_id=900129494&dest_type=landmark&dist=0&group_adults=1&group_children=0&hapos=2&highlighted_blocks=1464145601_419410702_1_0_0&hpos=2&matching_block_id=1464145601_419410702_1_0_0&no_rooms=1&req_adults=1&req_children=0&room1=A&sb_price_type=total&sr_order=popularity&sr_pri_blocks=1464145601_419410702_1_0_0__234000&srepoch=1755860409&srpvid=80464d5b992008af&type=total&ucfs=1&",
  };

  function handleHotelSelect(hotel: any) {
    console.log("Selected hotel:", hotel);
    // Handle hotel selection logic here
  }
</script>

<div class="demo-container">
  <h2>Hotel Book Card Demo</h2>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <HotelBookCard hotel={sampleHotelData} onSelect={handleHotelSelect} />
  </div>
</div>

<style>
  .demo-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  h2 {
    margin-bottom: 20px;
    color: #1f2937;
  }
</style>
