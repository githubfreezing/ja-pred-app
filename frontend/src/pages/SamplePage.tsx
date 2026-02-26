// import {useState} from "react";
// import { Box, Container, Grid, Stack} from "@mui/material"

// const App = () =>{
//     const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//     const [toDate, setToDate] = useState<string>("");

//     const handleDecide = async () => {
//         console.log("決定ボタン#########################", API_BASE_URL);

//         try {
//             const url = `${API_BASE_URL}/sample`;

//             const res = await fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//             },
//             body: JSON.stringify({
//                 toDate: toDate,
//             }),
//             });

//             if (!res.ok) {
//             const text = await res.text();
//             console.log("error####################", text);
//             return;
//             }

//             const data = await res.json();
//             console.log("success####################", data);

//         } catch (e) {
//             console.error(e);
//         }
//     };

//     return (
//         // <Box>
//         //     <Typography>サンプル</Typography>
//         //     <TextField
//         //         type="date"
//         //         value={toDate}
//         //         onChange={(e) => {
//         //                 const v = e.target.value;
//         //                 setToDate(v);
//         //             }}
//         //     />

//         //     <Button
//         //         type="button"
//         //         onClick={handleDecide}
//         //     >
//         //         決定
//         //     </Button>
//         // </Box>
//     <Container maxWidth="lg" sx={{ py: 3 }}>
//       <Grid container spacing={2} alignItems="stretch">
//         {/* 左：①ヘッダー + ②グラフ */}
//         <Grid item xs={12} md={8}>
//           <Stack spacing={2}>
//             <Box>
//               CCC
//             </Box>

//             AAA
//           </Stack>
//         </Grid>

//         {/* 右：③表 */}
//         <Grid item xs={12} md={4}>
//           BBB
//         </Grid>
//       </Grid>
//     </Container>
//     );
// }

// export default App;
