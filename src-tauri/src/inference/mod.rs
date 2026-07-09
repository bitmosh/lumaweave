// SPDX-License-Identifier: Apache-2.0
pub mod backend;
pub mod commands;
pub mod remote_client;
pub mod types;

pub use backend::InferenceBackend;
pub use commands::{chat, test_inference_connection};
pub use remote_client::RemoteClient;
pub use types::*;
