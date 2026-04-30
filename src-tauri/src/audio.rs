use rodio::{Decoder, DeviceSinkBuilder, Player};
use std::fs::File;
use std::io::BufReader;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

pub enum AudioCommand {
    Play(String),
    Pause,
    Resume,
    _Stop,
    SetVolume(f32),
    GetPos(mpsc::Sender<u64>),
    Seek(u64),
}

pub struct AudioState {
    pub tx: mpsc::Sender<AudioCommand>,
}

pub fn init_audio_thread() -> mpsc::Sender<AudioCommand> {
    let (tx, rx) = mpsc::channel::<AudioCommand>();

    thread::spawn(move || {
        let sink_handle = DeviceSinkBuilder::open_default_sink().unwrap();
        let player = Player::connect_new(&sink_handle.mixer());

        for cmd in rx {
            match cmd {
                AudioCommand::Play(path) => {
                    if let Ok(file) = File::open(&path) {
                        if let Ok(source) = Decoder::try_from(BufReader::new(file)) {
                            player.stop();
                            player.append(source);
                            player.play();
                        }
                    }
                }
                AudioCommand::Pause => player.pause(),
                AudioCommand::Resume => player.play(),
                AudioCommand::_Stop => player.stop(),
                AudioCommand::SetVolume(vol) => player.set_volume(vol),
                AudioCommand::GetPos(reply) => {
                    let _ = reply.send(player.get_pos().as_millis() as u64);
                }
                AudioCommand::Seek(pos_ms) => {
                    let _ = player.seek(Duration::from_millis(pos_ms));
                }
            }
        }
    });

    tx
}
